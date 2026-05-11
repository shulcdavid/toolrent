-- ToolRent database schema
-- Run this in the Supabase SQL editor after creating your project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone text,
  city text,
  created_at timestamptz default now() not null
);
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, city)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'city'
  );
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Listings
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null check (category in ('power','garden','construction','cleaning','automotive','other')),
  price_per_day numeric(10,2) not null check (price_per_day > 0),
  deposit numeric(10,2) default 0 not null,
  city text not null,
  address text,
  images text[] default '{}' not null,
  is_available boolean default true not null,
  created_at timestamptz default now() not null
);
alter table public.listings enable row level security;

create policy "Listings are viewable by everyone" on listings for select using (true);
create policy "Users can insert own listings" on listings for insert with check (auth.uid() = user_id);
create policy "Users can update own listings" on listings for update using (auth.uid() = user_id);
create policy "Users can delete own listings" on listings for delete using (auth.uid() = user_id);

-- Bookings
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  renter_id uuid references public.profiles(id) on delete cascade not null,
  start_date date not null,
  end_date date not null,
  total_price numeric(10,2) not null,
  status text default 'pending' not null
    check (status in ('pending','approved','rejected','completed','cancelled')),
  message text,
  created_at timestamptz default now() not null,
  constraint valid_dates check (end_date >= start_date)
);
alter table public.bookings enable row level security;

create policy "Renters see their own bookings" on bookings for select using (auth.uid() = renter_id);
create policy "Listing owners see their bookings"
  on bookings for select
  using (auth.uid() = (select user_id from listings where id = listing_id));
create policy "Renters can create bookings" on bookings for insert with check (auth.uid() = renter_id);
create policy "Listing owners can update booking status"
  on bookings for update
  using (auth.uid() = (select user_id from listings where id = listing_id));
create policy "Renters can cancel their bookings"
  on bookings for update using (auth.uid() = renter_id);

-- Reviews
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null unique,
  reviewer_id uuid references public.profiles(id) not null,
  reviewee_id uuid references public.profiles(id) not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now() not null
);
alter table public.reviews enable row level security;

create policy "Reviews are public" on reviews for select using (true);
create policy "Reviewer can insert" on reviews for insert with check (auth.uid() = reviewer_id);

-- Storage bucket for listing images
insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true);
create policy "Anyone can read listing images" on storage.objects for select using (bucket_id = 'listing-images');
create policy "Authenticated users can upload" on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');
create policy "Users can delete own uploads" on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);
