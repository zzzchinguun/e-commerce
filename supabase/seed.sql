-- ============================================
-- SEED DATA FOR E-COMMERCE MARKETPLACE
-- ============================================

-- Sample categories (hierarchical)
INSERT INTO public.categories (id, parent_id, name, slug, description, icon, sort_order, is_active) VALUES
    -- Main categories
    ('11111111-1111-1111-1111-111111111111', NULL, 'Electronics', 'electronics', 'Electronic devices and gadgets', 'laptop', 1, TRUE),
    ('11111111-1111-1111-1111-111111111112', NULL, 'Clothing', 'clothing', 'Fashion and apparel', 'shirt', 2, TRUE),
    ('11111111-1111-1111-1111-111111111113', NULL, 'Home & Garden', 'home-garden', 'Home improvement and garden supplies', 'home', 3, TRUE),
    ('11111111-1111-1111-1111-111111111114', NULL, 'Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', 'dumbbell', 4, TRUE),
    ('11111111-1111-1111-1111-111111111115', NULL, 'Books', 'books', 'Books, eBooks, and audiobooks', 'book', 5, TRUE),
    ('11111111-1111-1111-1111-111111111116', NULL, 'Beauty & Health', 'beauty-health', 'Beauty products and health supplies', 'heart', 6, TRUE),
    ('11111111-1111-1111-1111-111111111117', NULL, 'Toys & Games', 'toys-games', 'Toys, games, and entertainment', 'gamepad', 7, TRUE),
    ('11111111-1111-1111-1111-111111111118', NULL, 'Automotive', 'automotive', 'Car parts and accessories', 'car', 8, TRUE),

    -- Electronics subcategories
    ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Smartphones', 'smartphones', 'Mobile phones and accessories', 'smartphone', 1, TRUE),
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Laptops', 'laptops', 'Notebook computers and accessories', 'laptop', 2, TRUE),
    ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Audio', 'audio', 'Headphones, speakers, and audio equipment', 'headphones', 3, TRUE),
    ('22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', 'Cameras', 'cameras', 'Digital cameras and photography equipment', 'camera', 4, TRUE),
    ('22222222-2222-2222-2222-222222222225', '11111111-1111-1111-1111-111111111111', 'Gaming', 'gaming', 'Gaming consoles and accessories', 'gamepad', 5, TRUE),

    -- Clothing subcategories
    ('22222222-2222-2222-2222-222222222231', '11111111-1111-1111-1111-111111111112', 'Men''s Clothing', 'mens-clothing', 'Clothing for men', 'user', 1, TRUE),
    ('22222222-2222-2222-2222-222222222232', '11111111-1111-1111-1111-111111111112', 'Women''s Clothing', 'womens-clothing', 'Clothing for women', 'user', 2, TRUE),
    ('22222222-2222-2222-2222-222222222233', '11111111-1111-1111-1111-111111111112', 'Kids'' Clothing', 'kids-clothing', 'Clothing for children', 'user', 3, TRUE),
    ('22222222-2222-2222-2222-222222222234', '11111111-1111-1111-1111-111111111112', 'Shoes', 'shoes', 'Footwear for all', 'footprints', 4, TRUE),
    ('22222222-2222-2222-2222-222222222235', '11111111-1111-1111-1111-111111111112', 'Accessories', 'accessories', 'Fashion accessories', 'watch', 5, TRUE),

    -- Home & Garden subcategories
    ('22222222-2222-2222-2222-222222222241', '11111111-1111-1111-1111-111111111113', 'Furniture', 'furniture', 'Home furniture', 'armchair', 1, TRUE),
    ('22222222-2222-2222-2222-222222222242', '11111111-1111-1111-1111-111111111113', 'Kitchen', 'kitchen', 'Kitchen appliances and tools', 'utensils', 2, TRUE),
    ('22222222-2222-2222-2222-222222222243', '11111111-1111-1111-1111-111111111113', 'Bedding', 'bedding', 'Bedding and linens', 'bed', 3, TRUE),
    ('22222222-2222-2222-2222-222222222244', '11111111-1111-1111-1111-111111111113', 'Garden', 'garden', 'Garden tools and supplies', 'flower', 4, TRUE);

-- Note: Products, variants, and inventory will be added via the seller dashboard
-- or through additional seed scripts after sellers are created
