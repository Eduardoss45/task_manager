import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editTaskSchema } from "@/lib/validators/tasks/taskValidators";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type CreateTaskFormProps = {
  onSubmit: (data: any) => Promise<void>;
};

export function CreateTaskForm({ onSubmit }: CreateTaskFormProps) {
  const form = useForm({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 bg-zinc-900 p-6 rounded-xl border border-zinc-800 text-zinc-100"
    >
      <Input
        placeholder="Título"
        {...form.register("title")}
        className="bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 border-zinc-800 focus-visible:ring-blue-500"
      />

      <Textarea
        placeholder="Descrição"
        {...form.register("description")}
        className="bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 border-zinc-800 focus-visible:ring-blue-500"
      />

      <Controller
        name="dueDate"
        control={form.control}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                className="
    w-full h-10
    flex items-center justify-center
    rounded-md
    bg-zinc-950 text-zinc-100
    border border-zinc-800
    text-sm font-strong
    text-zinc-300
    focus-visible:ring-2 focus-visible:ring-blue-500
  "
              >
                {field.value ? new Date(field.value).toLocaleDateString() : "Selecione uma data"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={date => date && field.onChange(date.toISOString())}
                disabled={date => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        )}
      />

      <Button
        type="submit"
        className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
      >
        Criar Task
      </Button>
    </form>
  );
}
