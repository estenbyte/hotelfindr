import { randomBytes } from "node:crypto";
import { prisma } from "./db.server";
import { nightsBetween } from "./format";

/** Human-friendly booking reference, e.g. HF-7K3Q90. */
function generateReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  const bytes = randomBytes(6);
  let code = "";
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `HF-${code}`;
}

export type CreateBookingInput = {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
};

export type CreateBookingResult =
  | { ok: true; reference: string }
  | { ok: false; error: string };

/**
 * Create a confirmed booking, re-checking availability inside a transaction so
 * two concurrent requests can never oversell the same room for overlapping dates.
 */
export async function createBooking(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const { roomTypeId, checkIn, checkOut, guests, guestName, guestEmail } = input;

  const name = guestName.trim();
  const email = guestEmail.trim();
  if (!name || !email) {
    return { ok: false, error: "Name and email are required." };
  }
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) {
    return { ok: false, error: "Invalid dates." };
  }

  const ci = new Date(checkIn);
  const co = new Date(checkOut);

  try {
    const reference = await prisma.$transaction(async (tx) => {
      const roomType = await tx.roomType.findUnique({
        where: { id: roomTypeId },
      });
      if (!roomType) throw new Error("ROOM_NOT_FOUND");
      if (roomType.capacity < guests) throw new Error("OVER_CAPACITY");

      const booked = await tx.booking.count({
        where: {
          roomTypeId,
          status: "confirmed",
          checkIn: { lt: co },
          checkOut: { gt: ci },
        },
      });
      if (roomType.quantity - booked <= 0) throw new Error("SOLD_OUT");

      const ref = generateReference();
      await tx.booking.create({
        data: {
          reference: ref,
          roomTypeId,
          guestName: name,
          guestEmail: email,
          checkIn: ci,
          checkOut: co,
          guests,
          totalPrice: roomType.pricePerNight * nights,
          status: "confirmed",
        },
      });
      return ref;
    });

    return { ok: true, reference };
  } catch (e) {
    const code = e instanceof Error ? e.message : "UNKNOWN";
    const messages: Record<string, string> = {
      ROOM_NOT_FOUND: "That room no longer exists.",
      OVER_CAPACITY: "This room can't fit that many guests.",
      SOLD_OUT: "Sorry, this room was just booked for your dates.",
    };
    return { ok: false, error: messages[code] ?? "Could not complete booking." };
  }
}

/** Fetch a booking with its hotel/room context by reference. */
export async function getBookingByReference(reference: string) {
  return prisma.booking.findUnique({
    where: { reference },
    include: { roomType: { include: { hotel: true } } },
  });
}
