export type PackageStatus =
    | 'to_be_picked_up'
    | 'picked_up'
    | 'in_transit'
    | 'arrived'
    | 'delayed'
    | 'out_for_delivery'
    | 'delivered';

export type Region = {
    id: string;
    region_code: string;
    name: string;
    parent_region_id: string | null;
    created_at: Date;
};

export type FrontOffice = {
    id: string;
    name: string;
    address: string;
    region_id: string;
    phone: string | null;
    created_at: Date;
};

export type Package = {
    id: string;
    tracking_id: string;
    front_office_id: string;
    to_name: string;
    to_address: string;
    to_region_id: string;
    weight: number;
    current_status: PackageStatus;
    current_region_id: string;
    created_at: Date;
    updated_at: Date;
};

export type Sale = {
    id: string;
    package_id: string;
    amount: number;
    payment_method: string;
    receipt_number: string;
    issued_at: Date;
};

export type PackageScanLog = {
    id: string;
    package_id: string;
    region_id: string;
    status: PackageStatus;
    bag_id: string | null;
    notes: string | null;
    scanned_at: Date;
};