export interface DBModel {
    save(): Promise<void>;
    delete(): Promise<void>;
}
