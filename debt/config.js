// Для общего списка на всех устройствах заполните настройки Supabase.
// Здесь допустим только публичный publishable / anon key, НЕ secret / service_role.
// Владелец списка задаётся в supabase.sql; посетители видят записи без входа.
// Пустые значения включают хранение только в этом браузере.
export const config = Object.freeze({
  supabaseUrl: "https://bwnelxoghhbotenqbyxu.supabase.co",
  supabaseKey: "sb_publishable_tR8n5roNG0n8a4XFqEdrWA_7pRj7Ong",
});
