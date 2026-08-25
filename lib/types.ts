export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type OrderStatus = "pending" | "paid" | "expired" | "failed" | "processing" | "success";

export type Order = {
  id: string;
  trx_id: string;
  user_id: string | null;
  product_id: string;
  target: string;
  amount: number;
  status: OrderStatus;
  qris_string: string | null;
  qris_ref: string | null;
  created_at: string;
  updated_at: string;
};

export type RedeemCode = {
  id: string;
  code: string;
  product_id: string | null;
  quota: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  message: string;
  created_at: string;
};

export type AppUser = {
  id: string;
  username: string;
  created_at: string;
};
