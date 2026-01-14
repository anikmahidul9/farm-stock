
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export default function AddLivestockPage() {
  const [livestockType, setLivestockType] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = {
      type: livestockType,
      breed: formData.get("breed"),
      age: formData.get("age"),
      price: formData.get("price"),
      description: formData.get("description"),
      images: formData.getAll("images"),
    };
    console.log(data);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Add New Livestock</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="type">Livestock Type</Label>
            <Select onValueChange={setLivestockType}>
              <SelectTrigger>
                <SelectValue placeholder="Select livestock type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cattle">Cattle</SelectItem>
                <SelectItem value="sheep">Sheep</SelectItem>
                <SelectItem value="goat">Goat</SelectItem>
                <SelectItem value="chicken">Chicken</SelectItem>
                <SelectItem value="duck">Duck</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="breed">Breed</Label>
            <Input id="breed" name="breed" placeholder="e.g., Holstein, Merino" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="age">Age (months)</Label>
            <Input id="age" name="age" type="number" placeholder="e.g., 24" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (Tk)</Label>
            <Input id="price" name="price" type="number" placeholder="e.g., 150000" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="e.g., Healthy and vaccinated" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="images">Images</Label>
          <Input id="images" name="images" type="file" multiple />
        </div>
        <Button type="submit">Add Livestock</Button>
      </form>
    </div>
  );
}
