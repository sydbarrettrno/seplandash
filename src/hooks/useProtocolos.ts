import { useQuery } from "@tanstack/react-query";
import { carregarMetadata, carregarProtocolos } from "@/services/dataService";

export function useProtocolosQuery() {
  return useQuery({
    queryKey: ["protocolos-reais-v07"],
    queryFn: carregarProtocolos,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useProtocolos() {
  return useProtocolosQuery().data ?? [];
}

export function useMetadata() {
  return useQuery({
    queryKey: ["metadata-base-v07"],
    queryFn: carregarMetadata,
    staleTime: 60 * 1000,
    retry: 1,
  });
}
