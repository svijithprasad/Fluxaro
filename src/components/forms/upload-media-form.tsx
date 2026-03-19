"use client";
import React from "react";
import { z } from "zod";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { createMedia, saveActivityLogsNotification } from "@/lib/queries";
import { Input } from "../ui/input";
import FileUpload from "../global/file-upload";
import { Button } from "../ui/button";
import { useModal } from "@/providers/modal-provider";

type Props = {
  subAccountId: string;
};

const formSchema = z.object({
  link: z.string().min(1, { message: "Media file is required" }),
  name: z.string().min(1, { message: "Media file Name is required" }),
});

const UploadMediaForm = ({ subAccountId }: Props) => {
  const { setClose } = useModal();
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      link: "",
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await createMedia(subAccountId, values);

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Uploaded a Media file | ${response.name}`,
        subaccountId: subAccountId,
      });
      toast({ title: "Succes", description: "Uploaded media" });
      setClose();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed",
        description: "🔴 Error: Failed to Upload Media File",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media Information</CardTitle>
        <CardDescription>
          Please enter the details for your file.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>File Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your agency name" {...field} />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Media File</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="media"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <Button type="submit" className="mt-4">
              Upload Media
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UploadMediaForm;
