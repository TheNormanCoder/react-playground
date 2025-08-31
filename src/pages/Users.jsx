import { useQuery } from "@tanstack/react-query";

export default function Users() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["users"],
        queryFn: () =>
            fetch("https://jsonplaceholder.typicode.com/users").then(r => r.json()),
        staleTime: 60_000,
    });

    if (isLoading) return <p style={{ padding: 16 }}>Loading…</p>;
    if (error) return <p style={{ padding: 16, color: "crimson" }}>Errore</p>;

    return (
        <div style={{ padding: 16 }}>
            <h2>Users (React Query)</h2>
            <ul>{data.slice(0, 6).map(u => <li key={u.id}>{u.name}</li>)}</ul>
        </div>
    );
}
