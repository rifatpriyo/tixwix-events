import { Movie } from "@/components/movies/MovieCard";
import { Concert } from "@/components/concerts/ConcertCard";

// Sample movie data spanning Jan 01 2026 to Jan 20 2026
export const movies: Movie[] = [
  {
    id: "1",
    title: "Spider-Man: Across the Spider-Verse",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop",
    genre: ["Animation", "Action", "Adventure"],
    rating: 8.7,
    duration: "2h 20m",
    releaseDate: "2026-01-01",
    status: "now_showing",
  },
  {
    id: "2",
    title: "Guardians of the Galaxy Vol. 3",
    poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop",
    genre: ["Action", "Comedy", "Sci-Fi"],
    rating: 8.1,
    duration: "2h 30m",
    releaseDate: "2026-01-03",
    status: "now_showing",
  },
  {
    id: "3",
    title: "John Wick: Chapter 4",
    poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
    genre: ["Action", "Thriller", "Crime"],
    rating: 8.4,
    duration: "2h 49m",
    releaseDate: "2026-01-05",
    status: "now_showing",
  },
  {
    id: "4",
    title: "Oppenheimer",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    genre: ["Drama", "History", "Biography"],
    rating: 8.9,
    duration: "3h 0m",
    releaseDate: "2026-01-07",
    status: "now_showing",
  },
  {
    id: "5",
    title: "The Conjuring: Last Rites",
    poster: "https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400&h=600&fit=crop",
    genre: ["Horror", "Mystery", "Thriller"],
    rating: 7.8,
    duration: "2h 12m",
    releaseDate: "2026-01-10",
    status: "now_showing",
  },
  {
    id: "6",
    title: "Barbie",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    genre: ["Comedy", "Adventure", "Fantasy"],
    rating: 7.5,
    duration: "1h 54m",
    releaseDate: "2026-01-12",
    status: "now_showing",
  },
  {
    id: "7",
    title: "Mission Impossible: Dead Reckoning",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
    genre: ["Action", "Thriller", "Adventure"],
    rating: 8.2,
    duration: "2h 43m",
    releaseDate: "2026-01-15",
    status: "coming_soon",
  },
  {
    id: "8",
    title: "Dune: Part Two",
    poster: "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400&h=600&fit=crop",
    genre: ["Sci-Fi", "Drama", "Adventure"],
    rating: 8.6,
    duration: "2h 46m",
    releaseDate: "2026-01-18",
    status: "coming_soon",
  },
];

// Sample concert data
export const concerts: Concert[] = [
  {
    id: "1",
    title: "Souls of Bangladesh Live",
    artist: "Souls",
    poster: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop",
    date: "2026-01-05",
    venue: "TixWix Convention Hall",
    priceRange: { min: 1500, max: 5000 },
    status: "upcoming",
  },
  {
    id: "2",
    title: "Artcell Reunion Concert",
    artist: "Artcell",
    poster: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=450&fit=crop",
    date: "2026-01-10",
    venue: "TixWix Convention Hall",
    priceRange: { min: 2000, max: 8000 },
    status: "few_left",
  },
  {
    id: "3",
    title: "Aurthohin Night",
    artist: "Aurthohin",
    poster: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=450&fit=crop",
    date: "2026-01-15",
    venue: "TixWix Convention Hall",
    priceRange: { min: 1200, max: 4000 },
    status: "upcoming",
  },
  {
    id: "4",
    title: "Warfaze Legacy Tour",
    artist: "Warfaze",
    poster: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=450&fit=crop",
    date: "2026-01-20",
    venue: "TixWix Convention Hall",
    priceRange: { min: 1800, max: 6000 },
    status: "upcoming",
  },
];

// Movie genres for filtering
export const movieGenres = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Sci-Fi",
  "Thriller",
];

// Hall information
export const halls = [
  { id: "1", name: "Hall 1", type: "cinema", capacity: 150 },
  { id: "2", name: "Hall 2", type: "cinema", capacity: 150 },
  { id: "3", name: "Hall 3", type: "cinema", capacity: 120 },
  { id: "4", name: "Hall 4", type: "cinema", capacity: 120 },
  { id: "5", name: "Hall 5", type: "cinema", capacity: 100 },
  { id: "6", name: "Hall 6", type: "cinema", capacity: 100 },
  { id: "7", name: "Convention Hall", type: "concert", capacity: 2000 },
];

// Promo codes
export const promoCodes = [
  { code: "FIRSTORDER", discount: 10, description: "10% off on first order" },
  { code: "Priyorchotobhai", discount: 90, description: "90% off special discount" },
];

// Ticket prices (in BDT)
export const ticketPrices = {
  movie: {
    normal: 250,
    deluxe: 400,
    super: 600,
  },
  concert: {
    back: 1500,
    middle: 3000,
    front: 5000,
    vip: 8000,
  },
};
