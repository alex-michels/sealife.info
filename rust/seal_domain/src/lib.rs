pub fn normalize_species(name: &str, locale: &str) -> String {
// Placeholder: real impl will map RU/EN synonyms to canonical ids
let s = name.trim().to_lowercase();
match locale {
"ru" => s.replace("нерпа", "pusa hispida"),
_ => s,
}
}