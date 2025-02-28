// Generic paginated response interface
export interface PaginatedResponse<T, E = {}> {
    current_page: number;
    data: T[];
    from: number;
    last_page: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
    embedded: E;
}

// Brand interface based on the JSON sample
export interface IBrand {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    integration_id: number;
    consolidated?: number;  // 0

    internal_name?: string;
    logo?: string;
    colour?: string;
    success?: string;
    share?: string;
    weight?: number;
    deleted_at?: string | null;
    expiry?: number;
    website?: string;
    user_id?: string;
    email?: string | null;
    vat?: number;
    faq?: string | null;
    description?: string;
    redeem?: string | null;
    location_text?: string;
    map_pin_url?: string;
    default_location_description_markdown?: string;
    products?: string[];            // IDs of regular products
    consolidated_products?: string[]; // IDs of consolidated products
    stores?: string[];              // IDs of stores (if not embedded)
    logo_url?: string;
}

// Product interface (from the embedded.products array)
export interface IProduct {
    id: string;
    created_at: string;
    updated_at: string;

    brand_id?: string;
    description?: string;
    campaign?: any; // null or another type depending on your data
    label?: string;
    internal_name?: string;
    integration?: string;
    price?: string;
    over_18_offer?: number;
    redemption_instructions?: string;
    image?: string;
    subtitle?: string;
    weight?: number;
    recipient_description?: string;
    tag_group_id?: string;
    tag_id?: string;
    open_graph_image?: string;
    active?: number;
    on_app?: number;
    on_imessage?: number;
    handling_fee?: number;
    sale_price?: number;
    huggg_tag?: string;
    vat_voucher_type?: string;
    vat?: any;
    brand_name?: string;
    brand_weight?: number;
    image_url?: string;
    claim_image?: string;
    claim_image_url?: string;
    imessage_image?: string;
    imessage_image_url?: string;
    open_graph_image_url?: string;
}

// Store interface (from the embedded.stores array)
export interface IStore {
    id: string;
    name: string;
    visible?: number; // 0

    brand_id?: string;
    latitiude?: string;
    longitude?: string;
    website?: string | null;
    description?: string;
    description_markdown?: string;
    image?: string;
    image_url?: string;
    latitude?: string;
}
