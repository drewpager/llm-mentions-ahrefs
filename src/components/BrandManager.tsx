import { useState } from 'react';
import { Plus, X, Building2, Users } from 'lucide-react';
import type { Brand } from '../types';

interface BrandManagerProps {
  brands: Brand[];
  onBrandsChange: (brands: Brand[]) => void;
}

export function BrandManager({ brands, onBrandsChange }: BrandManagerProps) {
  const [newBrand, setNewBrand] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [isCompetitor, setIsCompetitor] = useState(false);

  const addBrand = () => {
    if (!newBrand.trim()) return;

    const brand: Brand = {
      id: crypto.randomUUID(),
      name: newBrand.trim(),
      domain: newDomain.trim() || undefined,
      isCompetitor,
    };

    onBrandsChange([...brands, brand]);
    setNewBrand('');
    setNewDomain('');
    setIsCompetitor(false);
  };

  const removeBrand = (id: string) => {
    onBrandsChange(brands.filter((b) => b.id !== id));
  };

  const targetBrands = brands.filter((b) => !b.isCompetitor);
  const competitors = brands.filter((b) => b.isCompetitor);

  return (
    <div className="brand-manager">
      <h3>Brand Management</h3>

      <div className="brand-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Brand name (e.g., Ahrefs)"
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addBrand()}
          />
          <input
            type="text"
            placeholder="Domain (optional, e.g., ahrefs.com)"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addBrand()}
          />
        </div>
        <div className="form-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isCompetitor}
              onChange={(e) => setIsCompetitor(e.target.checked)}
            />
            Add as competitor
          </label>
          <button onClick={addBrand} className="btn btn-primary">
            <Plus size={16} /> Add Brand
          </button>
        </div>
      </div>

      <div className="brand-lists">
        <div className="brand-section">
          <h4>
            <Building2 size={16} /> Your Brands ({targetBrands.length})
          </h4>
          <div className="brand-chips">
            {targetBrands.map((brand) => (
              <div key={brand.id} className="brand-chip target">
                <span className="brand-name">{brand.name}</span>
                {brand.domain && <span className="brand-domain">{brand.domain}</span>}
                <button onClick={() => removeBrand(brand.id)} className="remove-btn">
                  <X size={14} />
                </button>
              </div>
            ))}
            {targetBrands.length === 0 && (
              <span className="empty-state">No brands added yet</span>
            )}
          </div>
        </div>

        <div className="brand-section">
          <h4>
            <Users size={16} /> Competitors ({competitors.length})
          </h4>
          <div className="brand-chips">
            {competitors.map((brand) => (
              <div key={brand.id} className="brand-chip competitor">
                <span className="brand-name">{brand.name}</span>
                {brand.domain && <span className="brand-domain">{brand.domain}</span>}
                <button onClick={() => removeBrand(brand.id)} className="remove-btn">
                  <X size={14} />
                </button>
              </div>
            ))}
            {competitors.length === 0 && (
              <span className="empty-state">No competitors added yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
