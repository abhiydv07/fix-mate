"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Navigation,
  Search,
  Check,
  Star,
  X,
  Edit2,
} from "lucide-react";
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  AddressItem,
} from "@/lib/addresses";
import {
  searchAddressNominatim,
  reverseGeocodeNominatim,
  NominatimResult,
} from "@/lib/nominatim";
import { Button } from "@/components/ui/button";

// Dynamic import Leaflet Map with ssr: false to prevent window object errors during build
const AddressMap = dynamic(() => import("@/components/AddressMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-500 animate-pulse">
      Loading OpenStreetMap Leaflet Canvas...
    </div>
  ),
});

export function AddressManager() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Form State
  const [label, setLabel] = useState<string>("Home");
  const [line1, setLine1] = useState<string>("");
  const [line2, setLine2] = useState<string>("");
  const [city, setCity] = useState<string>("Noida");
  const [pincode, setPincode] = useState<string>("");
  const [lat, setLat] = useState<number>(12.9716);
  const [lng, setLng] = useState<number>(77.5946);
  const [isDefault, setIsDefault] = useState<boolean>(false);

  // Nominatim Autocomplete Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGeolocating, setIsGeolocating] = useState<boolean>(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  async function loadAddresses() {
    setIsLoading(true);
    const data = await getUserAddresses();
    setAddresses(data);
    setIsLoading(false);
  }

  // Handle Nominatim Address Search with Debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAddressNominatim(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: NominatimResult) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    setLat(newLat);
    setLng(newLng);
    setLine1(result.display_name.split(",")[0] || result.display_name);

    if (result.address) {
      if (result.address.city || result.address.town) {
        setCity(result.address.city || result.address.town || "Noida");
      }
      if (result.address.postcode) {
        setPincode(result.address.postcode);
      }
    }
    setSearchResults([]);
    setSearchQuery("");
  };

  // Handle "Use Current Location" Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;
        setLat(currentLat);
        setLng(currentLng);

        // Reverse geocode via Nominatim
        const reverseData = await reverseGeocodeNominatim(currentLat, currentLng);
        if (reverseData) {
          setLine1(reverseData.display_name.split(",")[0] || reverseData.display_name);
          if (reverseData.address) {
            setCity(reverseData.address.city || reverseData.address.town || "Noida");
            if (reverseData.address.postcode) setPincode(reverseData.address.postcode);
          }
        }
        setIsGeolocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Unable to fetch current location.");
        setIsGeolocating(false);
      }
    );
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!line1 || !city || !pincode) return;

    if (editingAddressId) {
      await updateAddress(editingAddressId, {
        label,
        line1,
        line2,
        city,
        pincode,
        lat,
        lng,
        is_default: isDefault,
      });
    } else {
      await createAddress({
        label,
        line1,
        line2,
        city,
        pincode,
        lat,
        lng,
        is_default: isDefault,
      });
    }

    closeModal();
    loadAddresses();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      await deleteAddress(id);
      loadAddresses();
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
    loadAddresses();
  };

  const openAddModal = () => {
    setEditingAddressId(null);
    setLabel("Home");
    setLine1("");
    setLine2("");
    setCity("Noida");
    setPincode("");
    setLat(12.9716);
    setLng(77.5946);
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: AddressItem) => {
    setEditingAddressId(addr.id);
    setLabel(addr.label || "Home");
    setLine1(addr.line1);
    setLine2(addr.line2 || "");
    setCity(addr.city);
    setPincode(addr.pincode);
    setLat(addr.lat || 12.9716);
    setLng(addr.lng || 77.5946);
    setIsDefault(addr.is_default);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchResults([]);
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-100">Saved Addresses</h3>
          <p className="text-[11px] text-slate-400">Manage service delivery locations</p>
        </div>
        <Button onClick={openAddModal} size="sm" className="flex items-center gap-1.5 text-xs">
          <Plus className="w-4 h-4" /> Add Address
        </Button>
      </div>

      {/* Address List Cards */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
          Loading saved addresses...
        </div>
      ) : addresses.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-semibold text-slate-300">No saved addresses yet</p>
          <p className="text-[11px] text-slate-500">Add an address for seamless service booking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-2xl bg-slate-900 border transition-all space-y-3 ${
                addr.is_default ? "border-brand-500/60 shadow-md shadow-brand-500/10" : "border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 text-xs font-bold">
                    {addr.label || "Home"}
                  </span>
                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Star className="w-3 h-3 fill-emerald-400" /> Default
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[10px] text-brand-400 hover:underline px-2 py-1"
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(addr)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-0.5 text-xs text-slate-300">
                <p className="font-semibold text-slate-100">{addr.line1}</p>
                {addr.line2 && <p className="text-slate-400">{addr.line2}</p>}
                <p className="text-slate-400">
                  {addr.city} — <strong className="text-slate-200">{addr.pincode}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-md w-full rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100">
                {editingAddressId ? "Edit Service Address" : "Add Service Address"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nominatim Search & Browser Geolocation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search building, street or landmark..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUseCurrentLocation}
                  disabled={isGeolocating}
                  className="shrink-0 flex items-center gap-1 text-[11px]"
                >
                  <Navigation className="w-3.5 h-3.5 text-brand-400" />
                  {isGeolocating ? "Locating..." : "GPS Location"}
                </Button>
              </div>

              {/* Nominatim Autocomplete Results Dropdown */}
              {isSearching && (
                <div className="p-2 text-[11px] text-slate-500 text-center animate-pulse">
                  Searching OpenStreetMap...
                </div>
              )}
              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 text-xs">
                  {searchResults.map((item) => (
                    <div
                      key={item.place_id}
                      onClick={() => handleSelectSearchResult(item)}
                      className="p-2.5 hover:bg-slate-800 cursor-pointer transition-colors text-slate-300 hover:text-white"
                    >
                      <p className="font-semibold line-clamp-1">{item.display_name.split(",")[0]}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{item.display_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Leaflet Map Component */}
            <AddressMap
              lat={lat}
              lng={lng}
              onPositionChange={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
              }}
            />

            {/* Address Form Inputs */}
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {["Home", "Work", "Other"].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setLabel(lbl)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      label === lbl
                        ? "bg-brand-500 text-white border-brand-400"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">House / Flat / Street (Line 1)</label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="e.g. Flat 402, Green Avenue, 10th Main"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="201301"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-300 font-medium">Set as default delivery address</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="px-5">
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
