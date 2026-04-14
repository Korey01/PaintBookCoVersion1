import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, X, Printer, RotateCcw, ExternalLink } from "lucide-react";
import { PAINT_PRODUCTS, PaintProduct, getTierColor, TIER_OPTIONS, FINISH_OPTIONS } from "@/lib/paint-products";
import {
  Room,
  generateEstimate,
  formatCurrency,
  formatArea,
  Estimate,
} from "@/lib/vestimator-utils";

const LOGO = "https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F58508160cf8c4641baffc02ea4d04605?format=webp&width=800";

type Step = "product" | "rooms" | "estimate";

export default function PaintVestimator() {
  const [step, setStep] = useState<Step>("product");
  const [selectedProduct, setSelectedProduct] = useState<PaintProduct | null>(null);
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "room-1",
      name: "Living Room",
      length: 5,
      width: 4,
      height: 2.4,
      includeCeiling: false,
      doors: 1,
      smallWindows: 0,
      mediumWindows: 2,
      largeWindows: 0,
      patioDoors: 0,
    },
  ]);
  const [numberOfCoats, setNumberOfCoats] = useState(2);
  const [estimate, setEstimate] = useState<Estimate | null>(null);

  // Filters for product selection
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [finishFilter, setFinishFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Filter products
  const filteredProducts = PAINT_PRODUCTS.filter((p) => {
    const tierMatch = tierFilter === "all" || p.tier === tierFilter;
    const finishMatch = finishFilter === "all" || p.finish === finishFilter;
    const searchMatch =
      searchFilter === "" ||
      p.brand.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase());
    return tierMatch && finishMatch && searchMatch;
  });

  // Handle step 1: Product selection
  const handleSelectProduct = (product: PaintProduct) => {
    setSelectedProduct(product);
  };

  // Handle step 2: Next to rooms
  const handleNextToRooms = () => {
    if (!selectedProduct) return;
    setStep("rooms");
  };

  // Handle step 2: Add room
  const handleAddRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: `Room ${rooms.length + 1}`,
      length: 4,
      width: 3,
      height: 2.4,
      includeCeiling: false,
      doors: 1,
      smallWindows: 1,
      mediumWindows: 1,
      largeWindows: 0,
      patioDoors: 0,
    };
    setRooms([...rooms, newRoom]);
  };

  // Handle room change
  const handleRoomChange = (id: string, field: keyof Room, value: any) => {
    setRooms(
      rooms.map((room) => (room.id === id ? { ...room, [field]: value } : room))
    );
  };

  // Handle delete room
  const handleDeleteRoom = (id: string) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((r) => r.id !== id));
    }
  };

  // Handle step 2: Calculate estimate
  const handleCalculateEstimate = () => {
    if (!selectedProduct || rooms.length === 0) return;
    const est = generateEstimate(
      rooms,
      numberOfCoats,
      selectedProduct.coveragePerLitre,
      selectedProduct.pricePerLitre,
      selectedProduct.availableSizes
    );
    setEstimate(est);
    setStep("estimate");
  };

  // Calculate total area
  const totalArea = rooms.reduce((sum, room) => {
    const wallArea = 2 * (room.length + room.width) * room.height;
    const deductions =
      room.doors * 1.89 +
      room.smallWindows * 0.84 +
      room.mediumWindows * 1.2 +
      room.largeWindows * 1.8 +
      room.patioDoors * 4.2;
    const netWall = Math.max(0, wallArea - deductions);
    const ceiling = room.includeCeiling ? room.length * room.width : 0;
    return sum + netWall + ceiling;
  }, 0);

  // Reset form
  const handleStartOver = () => {
    setStep("product");
    setSelectedProduct(null);
    setRooms([
      {
        id: "room-1",
        name: "Living Room",
        length: 5,
        width: 4,
        height: 2.4,
        includeCeiling: false,
        doors: 1,
        smallWindows: 0,
        mediumWindows: 2,
        largeWindows: 0,
        patioDoors: 0,
      },
    ]);
    setNumberOfCoats(2);
    setEstimate(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <a href="/" className="inline-block mb-6">
            <img src={LOGO} alt="PaintBookCo" className="h-8" />
          </a>
          <h1 className="text-3xl font-bold text-foreground">Paint Vestimator</h1>
          <p className="text-muted-foreground mt-2">
            Calculate how much paint you need for your project
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Step Indicator */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => step === "rooms" || step === "estimate" ? setStep("product") : null}
            className={`flex-1 h-1 rounded-full transition-colors ${
              step === "product"
                ? "bg-primary"
                : step === "rooms" || step === "estimate"
                ? "bg-primary/40 cursor-pointer"
                : "bg-border"
            }`}
          />
          <button
            onClick={() => step === "estimate" ? setStep("rooms") : null}
            className={`flex-1 h-1 rounded-full transition-colors ${
              step === "rooms"
                ? "bg-primary"
                : step === "estimate"
                ? "bg-primary/40 cursor-pointer"
                : "bg-border"
            }`}
          />
          <div className={`flex-1 h-1 rounded-full transition-colors ${step === "estimate" ? "bg-primary" : "bg-border"}`} />
        </div>

        {/* STEP 1: SELECT PRODUCT */}
        {step === "product" && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-2">Step 1: Choose Your Paint</h2>
            <p className="text-muted-foreground mb-8">Select from 30 popular UK paint brands</p>

            {/* Filters */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Search by brand or product</label>
                <input
                  type="text"
                  placeholder="e.g. Dulux, Farrow & Ball..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tier</label>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {TIER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Finish</label>
                  <select
                    value={finishFilter}
                    onChange={(e) => setFinishFilter(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {FINISH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`surface-card p-6 rounded-lg border-2 transition-all text-left ${
                    selectedProduct?.id === product.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-foreground">{product.brand}</p>
                      <p className="text-sm text-muted-foreground">{product.name}</p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <div className="text-primary font-bold">✓</div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">{product.finish}</span> • {product.coveragePerLitre} m²/L
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      {formatCurrency(product.pricePerLitre)}/L
                    </p>
                  </div>

                  <div className="flex gap-2 items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTierColor(product.tier)}`}>
                      {product.tier.charAt(0).toUpperCase() + product.tier.slice(1)}
                    </span>
                    <a
                      href={product.infoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/70 text-xs flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Info <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 justify-between">
              <a href="/" className="px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted">
                Cancel
              </a>
              <button
                onClick={handleNextToRooms}
                disabled={!selectedProduct}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                Next: Measure Rooms →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MEASURE ROOMS */}
        {step === "rooms" && selectedProduct && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-2">Step 2: Measure Your Rooms</h2>
            <p className="text-muted-foreground mb-8">Enter dimensions and openings for each room</p>

            {/* Rooms */}
            <div className="space-y-6 mb-8">
              {rooms.map((room) => (
                <div key={room.id} className="surface-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => handleRoomChange(room.id, "name", e.target.value)}
                      className="text-lg font-semibold bg-transparent border-b border-border text-foreground focus:outline-none"
                    />
                    {rooms.length > 1 && (
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Length (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={room.length}
                        onChange={(e) => handleRoomChange(room.id, "length", parseFloat(e.target.value))}
                        className="w-full bg-muted border border-border rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Width (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={room.width}
                        onChange={(e) => handleRoomChange(room.id, "width", parseFloat(e.target.value))}
                        className="w-full bg-muted border border-border rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Height (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={room.height}
                        onChange={(e) => handleRoomChange(room.id, "height", parseFloat(e.target.value))}
                        className="w-full bg-muted border border-border rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 mb-4 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={room.includeCeiling}
                      onChange={(e) => handleRoomChange(room.id, "includeCeiling", e.target.checked)}
                      className="w-4 h-4"
                    />
                    Include ceiling
                  </label>

                  {/* Openings */}
                  <div className="bg-muted/50 rounded px-4 py-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground">Openings to deduct</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { key: "doors", label: "Doors", value: room.doors },
                        { key: "smallWindows", label: "Small Windows", value: room.smallWindows },
                        { key: "mediumWindows", label: "Medium Windows", value: room.mediumWindows },
                        { key: "largeWindows", label: "Large Windows", value: room.largeWindows },
                        { key: "patioDoors", label: "Patio Doors", value: room.patioDoors },
                      ].map((opening) => (
                        <div key={opening.key}>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            {opening.label}
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleRoomChange(
                                  room.id,
                                  opening.key as keyof Room,
                                  Math.max(0, opening.value - 1)
                                )
                              }
                              className="p-1 border border-border rounded hover:bg-muted"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={opening.value}
                              onChange={(e) =>
                                handleRoomChange(
                                  room.id,
                                  opening.key as keyof Room,
                                  Math.max(0, parseInt(e.target.value) || 0)
                                )
                              }
                              className="w-12 bg-muted border border-border rounded px-2 py-1 text-center text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <button
                              onClick={() =>
                                handleRoomChange(
                                  room.id,
                                  opening.key as keyof Room,
                                  opening.value + 1
                                )
                              }
                              className="p-1 border border-border rounded hover:bg-muted"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Room Button */}
            <button
              onClick={handleAddRoom}
              className="flex items-center gap-2 mb-8 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted"
            >
              <Plus className="h-4 w-4" /> Add Room
            </button>

            {/* Number of Coats */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-foreground mb-3">Number of coats</label>
              <div className="flex gap-4">
                {[1, 2, 3].map((coat) => (
                  <label key={coat} className="flex items-center gap-2 text-foreground">
                    <input
                      type="radio"
                      name="coats"
                      value={coat}
                      checked={numberOfCoats === coat}
                      onChange={(e) => setNumberOfCoats(parseInt(e.target.value))}
                      className="w-4 h-4"
                    />
                    {coat} {coat === 1 ? "coat" : "coats"}
                  </label>
                ))}
              </div>
            </div>

            {/* Total Area */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
              <p className="text-sm text-muted-foreground">Total area across all rooms</p>
              <p className="text-2xl font-bold text-foreground">{formatArea(totalArea)}</p>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 justify-between">
              <button
                onClick={() => setStep("product")}
                className="px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted"
              >
                ← Back
              </button>
              <button
                onClick={handleCalculateEstimate}
                disabled={rooms.length === 0}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                Calculate Estimate →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ESTIMATE */}
        {step === "estimate" && selectedProduct && estimate && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground mb-8">Step 3: Your Paint Estimate</h2>

            {/* Summary Card */}
            <div className="surface-card border-2 border-primary rounded-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Paint Estimate Summary</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Product</span>
                  <span className="text-foreground font-semibold">
                    {selectedProduct.brand} {selectedProduct.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Finish</span>
                  <span className="text-foreground font-semibold">{selectedProduct.finish}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Coverage</span>
                  <span className="text-foreground font-semibold">
                    {selectedProduct.coveragePerLitre} m² per litre
                  </span>
                </div>
              </div>

              <div className="bg-muted/50 rounded px-4 py-4 mb-8 space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Total surface area</span>
                  <span className="text-foreground font-semibold">{formatArea(estimate.totalAreaSqm)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Number of coats</span>
                  <span className="text-foreground font-semibold">{numberOfCoats}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Paint required</span>
                  <span className="text-foreground font-semibold">{estimate.paintNeededLitres}L</span>
                </div>
                <div className="flex justify-between py-2 text-xs text-muted-foreground">
                  <span>(inc. 10% professional waste factor)</span>
                  <span className="font-semibold">{estimate.paintWithWasteLitres}L total</span>
                </div>
              </div>

              <div className="bg-primary/10 rounded px-4 py-4 mb-8">
                <p className="text-sm text-muted-foreground mb-2">Recommended tins</p>
                <div className="space-y-1">
                  {estimate.tins.map((tin, idx) => (
                    <p key={idx} className="text-foreground font-semibold">
                      {tin.quantity} × {tin.size}L = {tin.subtotal}L
                    </p>
                  ))}
                </div>
              </div>

              <div className="bg-amber-900/30 border border-amber-700/50 rounded px-4 py-4">
                <p className="text-xl font-bold text-amber-100 mb-2">Estimated Cost</p>
                <p className="text-3xl font-bold text-amber-300 mb-2">{formatCurrency(estimate.totalCost)}</p>
                <p className="text-xs text-amber-100/70">
                  {estimate.tins.map((t) => t.quantity).reduce((a, b) => a + b, 0)} tins at{" "}
                  {formatCurrency(selectedProduct.pricePerLitre)}/litre
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-border/50 rounded-lg p-4 mb-8 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-2">Coverage Information Disclaimer</p>
              <p>
                Coverage rates are approximate and based on manufacturer specifications for smooth, previously painted
                surfaces. Actual coverage may vary depending on surface texture, porosity, and application method.
              </p>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
              <button
                onClick={() =>
                  window.open(selectedProduct.productUrl, "_blank")
                }
                className="flex items-center justify-center gap-2 px-6 py-3 border border-primary rounded-lg text-primary hover:bg-primary/10"
              >
                <ExternalLink className="h-4 w-4" /> View Product
              </button>
              <button
                onClick={handleStartOver}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
              >
                <RotateCcw className="h-4 w-4" /> Start Over
              </button>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setStep("rooms")}
              className="px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted"
            >
              ← Back to Edit
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
