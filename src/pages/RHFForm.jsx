import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
    name: z.string().min(2, "Min 2 caratteri"),
    email: z.string().email("Email non valida"),
});

export default function RHFForm() {
    const { register, handleSubmit, formState: { errors } } =
        useForm({ resolver: zodResolver(schema) });

    return (
        <div style={{ padding: 16 }}>
            <h2>Form (React Hook Form + Zod)</h2>
            <form onSubmit={handleSubmit(v => alert(JSON.stringify(v, null, 2)))}>
                <div style={{ marginBottom: 10 }}>
                    <label>Nome</label><br />
                    <input {...register("name")} />
                    {errors.name && <div style={{ color: "crimson" }}>{errors.name.message}</div>}
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label>Email</label><br />
                    <input {...register("email")} />
                    {errors.email && <div style={{ color: "crimson" }}>{errors.email.message}</div>}
                </div>

                <button>Invia</button>
            </form>
        </div>
    );
}
