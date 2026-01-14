"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  getDocs,
} from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, MapPin, Trash2, Edit } from "lucide-react"
import { toast } from "sonner"

interface Address {
  id: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  isDefault: boolean
}

export function AddressManager() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null)

  const [formState, setFormState] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    isDefault: false,
  })

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "users", user.uid, "addresses"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userAddresses: Address[] = []
      querySnapshot.forEach((doc) => {
        userAddresses.push({ id: doc.id, ...doc.data() } as Address)
      })
      setAddresses(userAddresses)
    })

    return () => unsubscribe()
  }, [user])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormState((prevState) => ({ ...prevState, [id]: value }))
  }

  const handleAddNewAddress = () => {
    setSelectedAddress(null)
    setFormState({
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
      isDefault: false,
    })
    setIsDialogOpen(true)
  }

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address)
    setFormState(address)
    setIsDialogOpen(true)
  }

  const handleSaveAddress = async () => {
    if (!user) return

    try {
      if (selectedAddress) {
        // Update existing address
        const addressDocRef = doc(db, "users", user.uid, "addresses", selectedAddress.id)
        await updateDoc(addressDocRef, formState)
        toast.success("Address updated successfully!")
      } else {
        // Add new address
        const addressesCollectionRef = collection(db, "users", user.uid, "addresses")
        await addDoc(addressesCollectionRef, formState)
        toast.success("Address added successfully!")
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving address:", error)
      toast.error("Failed to save address.")
    }
  }

  const handleDeleteAddress = async () => {
    if (!user || !addressToDelete) return

    try {
      const addressDocRef = doc(db, "users", user.uid, "addresses", addressToDelete)
      await deleteDoc(addressDocRef)
      toast.success("Address deleted successfully!")
      setIsAlertOpen(false)
      setAddressToDelete(null)
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Failed to delete address.")
    }
  }

  const handleSetAsDefault = async (addressId: string) => {
    if (!user) return

    const batch = writeBatch(db)
    const addressesCollectionRef = collection(db, "users", user.uid, "addresses")
    const querySnapshot = await getDocs(addressesCollectionRef)

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, { isDefault: doc.id === addressId })
    })

    try {
      await batch.commit()
      toast.success("Default address updated successfully!")
    } catch (error) {
      console.error("Error setting default address:", error)
      toast.error("Failed to set default address.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={handleAddNewAddress}
            className="bg-orange-600 hover:bg-orange-700 text-white gap-2 self-start"
          >
            <Plus className="h-4 w-4" />
            Add New Address
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="street" className="text-right">
                Street
              </Label>
              <Input id="street" value={formState.street} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                City
              </Label>
              <Input id="city" value={formState.city} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">
                State
              </Label>
              <Input id="state" value={formState.state} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zip" className="text-right">
                Zip Code
              </Label>
              <Input id="zip" value={formState.zip} onChange={handleFormChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                Country
              </Label>
              <Input id="country" value={formState.country} onChange={handleFormChange} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveAddress}>Save Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {addresses.map((address) => (
        <Card key={address.id} className="border-orange-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-orange-950">
                      {address.street}, {address.city}
                    </h3>
                    {address.isDefault && (
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-orange-600/70 mt-1">
                    {address.state}, {address.zip}, {address.country}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetAsDefault(address.id)}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAddress(address)}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-transparent"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog open={isAlertOpen && addressToDelete === address.id} onOpenChange={(open) => {
                  if(!open) setAddressToDelete(null);
                  setIsAlertOpen(open);
                }}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAddressToDelete(address.id);
                        setIsAlertOpen(true);
                      }}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this address.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAddress}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}