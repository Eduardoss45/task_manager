export function formatDate(date?: string) {
  if (!date) return "Sem prazo";

  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
