import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSmartLinks } from "@/hooks/useSmartLinks";
import { useSmartRooms } from "@/hooks/useSmartRooms";
import { ISmartLink, ISmartRoom, SmartLinkAccess } from "@/types";
import { Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface SearchProductInputProps {
  productType: "smartlink" | "smartroom";
  selectedProductId?: string;
  onSelectProduct: (
    productId: string,
    product: ISmartLink | ISmartRoom
  ) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

const SearchProductInput: React.FC<SearchProductInputProps> = ({
  productType,
  selectedProductId,
  onSelectProduct,
  error,
  label = "Select Product",
  placeholder = "Search products...",
}) => {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<
    ISmartLink | ISmartRoom | undefined
  >(undefined);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const shouldSearch = dropdownOpen || !!search;

  const { smartLinks, isLoading: smartLinksLoading } = useSmartLinks({
    access: SmartLinkAccess.PAYWALL,
    search: productType === "smartlink" && shouldSearch ? search : undefined,
    perPage: 10,
    enabled: productType === "smartlink" && shouldSearch,
  });

  const { smartRooms, isLoading: smartRoomsLoading } = useSmartRooms({
    access: SmartLinkAccess.PAYWALL,
    search: productType === "smartroom" && shouldSearch ? search : undefined,
    perPage: 10,
  });

  const isLoading =
    productType === "smartlink" ? smartLinksLoading : smartRoomsLoading;
  const productList =
    productType === "smartlink"
      ? (smartLinks as (ISmartLink | ISmartRoom)[])
      : (smartRooms as (ISmartLink | ISmartRoom)[]);

  useEffect(() => {
    if (selectedProductId && productList.length > 0) {
      const product = productList.find((p) => p.id === selectedProductId);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [selectedProductId, productList]);

  const handleSearchFocus = () => setDropdownOpen(true);
  const handleSearchBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => setDropdownOpen(false), 150);
  };

  const handleSelectProduct = (product: ISmartLink | ISmartRoom) => {
    onSelectProduct(product.id, product);
    setSelectedProduct(product);
    setDropdownOpen(false);
    setSearch("");
  };

  const getProductName = (product: ISmartLink | ISmartRoom) => {
    if (productType === "smartlink") {
      const link = product as ISmartLink;
      return (
        link.name ||
        link.media?.metadata?.title ||
        link.media?.name ||
        "Untitled SmartLink"
      );
    } else {
      const room = product as ISmartRoom;
      return room.name || "Untitled SmartRoom";
    }
  };

  const getProductDescription = (product: ISmartLink | ISmartRoom) => {
    if (productType === "smartlink") {
      const link = product as ISmartLink;
      const price = link.price
        ? `$${link.price.toFixed(2)} ${link.currency || ""}`
        : "Free";
      return price;
    } else {
      const room = product as ISmartRoom;
      const price = room.price
        ? `$${room.price.toFixed(2)} ${room.currency || ""}`
        : "Free";
      return price;
    }
  };

  return (
    <div className="relative">
      <Label className="mb-2">{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search size={18} />
        </span>
        <Input
          className="pl-10"
          placeholder={placeholder}
          value={selectedProduct ? getProductName(selectedProduct) : search}
          onFocus={handleSearchFocus}
          onBlur={(e) =>
            handleSearchBlur(e as React.FocusEvent<HTMLInputElement>)
          }
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedProduct(undefined);
          }}
          ref={inputRef}
        />
        {dropdownOpen && !selectedProduct && (
          <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-muted rounded shadow-lg z-10 border">
            {isLoading ? (
              <div className="p-4 text-muted-foreground text-center">
                Loading...
              </div>
            ) : productList.length === 0 ? (
              <div className="p-4 text-muted-foreground text-center">
                No {productType === "smartlink" ? "SmartLink" : "SmartRoom"}{" "}
                found
              </div>
            ) : (
              <ul className="divide-y">
                {productList.map((product) => (
                  <li
                    key={product.id}
                    className="px-4 py-2 cursor-pointer hover:bg-accent/10"
                    onMouseDown={() => handleSelectProduct(product)}
                  >
                    <div className="font-semibold">
                      {getProductName(product)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getProductDescription(product)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {error && <div className="text-destructive text-xs mt-1">{error}</div>}
    </div>
  );
};

export default SearchProductInput;
