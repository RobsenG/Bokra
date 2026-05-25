"use client";

import { createProperty } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react"; // Next.js 15 uses useActionState instead of useFormState
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewPropertyPage() {
  // Simple progressive enhancement setup (can be improved with react-hook-form)
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">List a New Property</CardTitle>
          <CardDescription>Fill out the details below to add a new listing to Bokra Stay.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createProperty} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="title">Property Title</Label>
              <Input id="title" name="title" placeholder="e.g. Cozy Apartment in Addis Ababa" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Describe your property..." rows={4} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="123 Bole Road" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="Addis Ababa" required />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerNight">Price / Night ($)</Label>
                <Input id="pricePerNight" name="pricePerNight" type="number" min="0" step="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input id="bedrooms" name="bedrooms" type="number" min="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input id="bathrooms" name="bathrooms" type="number" min="1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxGuests">Max Guests</Label>
                <Input id="maxGuests" name="maxGuests" type="number" min="1" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amenities">Amenities (comma separated)</Label>
              <Input id="amenities" name="amenities" placeholder="WiFi, Kitchen, Free Parking" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Property Images</Label>
              <Input id="images" name="images" type="file" multiple accept="image/*" required />
              <p className="text-xs text-muted-foreground">You can select multiple images at once.</p>
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>Cancel</Button>
              <Button type="submit">Create Listing</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
