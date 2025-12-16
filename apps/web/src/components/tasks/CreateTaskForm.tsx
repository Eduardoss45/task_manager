import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CreateTaskFormProps = {
  onSubmit: (data: any) => Promise<void>;
};

export function CreateTaskForm({ onSubmit }: CreateTaskFormProps) {
  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="
        space-y-4
        bg-zinc-900
        p-6
        rounded-xl
        border
        border-zinc-800
        text-zinc-100
      "
    >
      <Input
        placeholder="Título"
        {...form.register("title", { required: true })}
        className="
          bg-zinc-950
          text-zinc-100
          placeholder:text-zinc-500
          border-zinc-800
          focus-visible:ring-blue-500
        "
      />

      <Textarea
        placeholder="Descrição"
        {...form.register("description")}
        className="
          bg-zinc-950
          text-zinc-100
          placeholder:text-zinc-500
          border-zinc-800
          focus-visible:ring-blue-500
        "
      />

      <Input
        type="date"
        {...form.register("dueDate")}
        className="
          bg-zinc-950
          text-zinc-100
          border-zinc-800
          focus-visible:ring-blue-500
          [&::-webkit-calendar-picker-indicator]:invert
        "
      />

      <Button
        type="submit"
        className="
          w-full
          mt-2
          bg-blue-600
          hover:bg-blue-500
          active:bg-blue-700
          text-white
          shadow-md
          hover:shadow-lg
          transition-all
          focus-visible:ring-2
          focus-visible:ring-blue-500
          focus-visible:ring-offset-2
          focus-visible:ring-offset-zinc-950
        "
      >
        Criar Task
      </Button>
    </form>
  );
}
