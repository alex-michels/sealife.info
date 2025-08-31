use wasm_bindgen::prelude::*;


#[wasm_bindgen]
pub fn normalize_species_wasm(name: &str, locale: &str) -> String {
seal_domain::normalize_species(name, locale)
}