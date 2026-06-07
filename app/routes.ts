import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("search", "routes/search.tsx"),
  route("hotels/:hotelId", "routes/hotel.tsx"),
  route("hotels/:hotelId/book", "routes/book.tsx"),
  route("confirmation/:reference", "routes/confirmation.tsx"),
  route("track", "routes/track.tsx"),
] satisfies RouteConfig;
