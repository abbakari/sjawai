// Discount Service - Manages category and brand-based discount rules
// Converted from PHP getCategoryDiscount() function

export interface DiscountRule {
  id: string;
  category: string;
  brand: string;
  discountPercentage: number; // Stored as percentage (e.g., 22.77 for 22.77%)
  isEditable: boolean;
  lastModified: string;
  modifiedBy?: string;
}

export interface DiscountCalculationResult {
  originalAmount: number;
  discountPercentage: number;
  discountAmount: number;
  finalAmount: number;
  appliedRule?: DiscountRule;
}

class DiscountService {
  private discountRules: DiscountRule[] = [
    // P4X4 Category
    { id: 'p4x4_bf_goodrich', category: 'P4X4', brand: 'BF GOODRICH', discountPercentage: 22.77, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'p4x4_giti', category: 'P4X4', brand: 'GITI', discountPercentage: 9.33, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'p4x4_michelin', category: 'P4X4', brand: 'MICHELIN', discountPercentage: 18.29, isEditable: true, lastModified: new Date().toISOString() },
    
    // TBR Category
    { id: 'tbr_aeolus', category: 'TBR', brand: 'AEOLUS', discountPercentage: 0.04, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'tbr_bf_goodrich', category: 'TBR', brand: 'BF GOODRICH', discountPercentage: 17.61, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'tbr_michelin', category: 'TBR', brand: 'MICHELIN', discountPercentage: 11.26, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'tbr_giti', category: 'TBR', brand: 'GITI', discountPercentage: 0.76, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'tbr_advance', category: 'TBR', brand: 'ADVANCE', discountPercentage: 0.13, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'tbr_tigar', category: 'TBR', brand: 'TIGAR', discountPercentage: 14.29, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'tbr_bridgestone', category: 'TBR', brand: 'BRIDGESTONE', discountPercentage: 30.2, isEditable: true, lastModified: new Date().toISOString() },
    
    // AGR Category
    { id: 'agr_petlas', category: 'AGR', brand: 'PETLAS', discountPercentage: 3.08, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'agr_michelin', category: 'AGR', brand: 'MICHELIN', discountPercentage: 7.55, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'agr_bkt', category: 'AGR', brand: 'BKT', discountPercentage: 10.0, isEditable: true, lastModified: new Date().toISOString() },
    
    // SPR Category
    { id: 'spr_bpw', category: 'SPR', brand: 'BPW', discountPercentage: 3.6, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_wabco', category: 'SPR', brand: 'WABCO', discountPercentage: 4.16, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_3m', category: 'SPR', brand: '3M', discountPercentage: 2.63, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_textar', category: 'SPR', brand: 'TEXTAR', discountPercentage: 3.94, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_contitech', category: 'SPR', brand: 'CONTITECH', discountPercentage: 4.26, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_don', category: 'SPR', brand: 'DON', discountPercentage: 4.09, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_donaldson', category: 'SPR', brand: 'DONALDSON', discountPercentage: 3.0, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_varta', category: 'SPR', brand: 'VARTA', discountPercentage: 4.29, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_vbg', category: 'SPR', brand: 'VBG', discountPercentage: 2.35, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_jost', category: 'SPR', brand: 'JOST', discountPercentage: 6.08, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_mann_filter', category: 'SPR', brand: 'MANN FILTER', discountPercentage: 3.56, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_nisshinbo', category: 'SPR', brand: 'NISSHINBO', discountPercentage: 6.25, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_hella', category: 'SPR', brand: 'HELLA', discountPercentage: 3.81, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_sach', category: 'SPR', brand: 'SACH', discountPercentage: 4.97, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_waikar', category: 'SPR', brand: 'WAIKAR', discountPercentage: 3.02, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_myers', category: 'SPR', brand: 'MYERS', discountPercentage: 3.0, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_tank_fittings', category: 'SPR', brand: 'TANK FITTINGS', discountPercentage: 3.91, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_tyre_accessories', category: 'SPR', brand: 'Tyre accessories and Spares', discountPercentage: 2.27, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_corghi', category: 'SPR', brand: 'CORGHI', discountPercentage: 1.89, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_fronius', category: 'SPR', brand: 'FRONIUS', discountPercentage: 5.0, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_kahveci', category: 'SPR', brand: 'KAHVECI OTOMOTIV', discountPercentage: 4.81, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_zeca', category: 'SPR', brand: 'ZECA', discountPercentage: 0.37, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_fini', category: 'SPR', brand: 'FINI', discountPercentage: 2.4, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'spr_jmc', category: 'SPR', brand: 'JMC', discountPercentage: 5.0, isEditable: true, lastModified: new Date().toISOString() },
    
    // IND Category
    { id: 'ind_advance', category: 'IND', brand: 'ADVANCE', discountPercentage: 1.69, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'ind_camso', category: 'IND', brand: 'CAMSO', discountPercentage: 1.79, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'ind_michelin', category: 'IND', brand: 'MICHELIN', discountPercentage: 4.76, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'ind_petlas', category: 'IND', brand: 'PETLAS', discountPercentage: 20.0, isEditable: true, lastModified: new Date().toISOString() },
    
    // OTR Category
    { id: 'otr_advance', category: 'OTR', brand: 'ADVANCE', discountPercentage: 0.3, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'otr_michelin', category: 'OTR', brand: 'MICHELIN', discountPercentage: 3.29, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'otr_techking', category: 'OTR', brand: 'TECHKING', discountPercentage: 0.37, isEditable: true, lastModified: new Date().toISOString() },
    
    // Services Categories
    { id: 'services_all', category: 'Services', brand: '', discountPercentage: 0.21, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'trl_ser_all', category: 'TRL-SER', brand: '', discountPercentage: 0.2, isEditable: true, lastModified: new Date().toISOString() },
    
    // HDE Services
    { id: 'hde_services_heli', category: 'HDE Services', brand: 'HELI', discountPercentage: 0.48, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'hde_services_jmc', category: 'HDE Services', brand: 'JMC', discountPercentage: 0.72, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'hde_services_gb_power', category: 'HDE Services', brand: 'GB POWER', discountPercentage: 0.26, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'hde_services_gaither', category: 'HDE Services', brand: 'GAITHER TOOL', discountPercentage: 2.54, isEditable: true, lastModified: new Date().toISOString() },
    
    // HDE Category
    { id: 'hde_gb_power', category: 'HDE', brand: 'GB POWER', discountPercentage: 0.56, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'hde_heli', category: 'HDE', brand: 'HELI', discountPercentage: 0.06, isEditable: true, lastModified: new Date().toISOString() },
    
    // GEP Category
    { id: 'gep_corghi', category: 'GEP', brand: 'Corghi', discountPercentage: 0.98, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'gep_heli', category: 'GEP', brand: 'HELI', discountPercentage: 0.46, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'gep_fini', category: 'GEP', brand: 'FINI', discountPercentage: 0.9, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'gep_combijet', category: 'GEP', brand: 'COMBIJET', discountPercentage: 5.0, isEditable: true, lastModified: new Date().toISOString() },
    { id: 'gep_gb_power', category: 'GEP', brand: 'GB POWER', discountPercentage: 1.04, isEditable: true, lastModified: new Date().toISOString() }
  ];

  private readonly STORAGE_KEY = 'discount_rules';
  private readonly MAX_DISCOUNT_PERCENTAGE = 50; // Maximum discount allowed
  private readonly MIN_DISCOUNT_PERCENTAGE = 0;  // Minimum discount allowed

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get category discount based on category and brand
   * Returns discount multiplier (1 - discountPercentage/100)
   */
  getCategoryDiscount(category: string, brand: string): number {
    const rule = this.findDiscountRule(category, brand);
    if (rule) {
      return 1 - (rule.discountPercentage / 100);
    }
    return 1; // No discount
  }

  /**
   * Calculate discount for a given amount
   */
  calculateDiscount(amount: number, category: string, brand: string): DiscountCalculationResult {
    const rule = this.findDiscountRule(category, brand);
    const discountPercentage = rule ? rule.discountPercentage : 0;
    const discountAmount = amount * (discountPercentage / 100);
    const finalAmount = amount - discountAmount;

    return {
      originalAmount: amount,
      discountPercentage,
      discountAmount,
      finalAmount,
      appliedRule: rule
    };
  }

  /**
   * Find discount rule for category and brand combination
   */
  private findDiscountRule(category: string, brand: string): DiscountRule | undefined {
    // First try exact match
    let rule = this.discountRules.find(r => 
      r.category.toLowerCase() === category.toLowerCase() && 
      r.brand.toLowerCase() === brand.toLowerCase()
    );

    // If no exact match and brand is empty, try category-only match
    if (!rule && brand === '') {
      rule = this.discountRules.find(r => 
        r.category.toLowerCase() === category.toLowerCase() && 
        r.brand === ''
      );
    }

    return rule;
  }

  /**
   * Get all discount rules
   */
  getAllRules(): DiscountRule[] {
    return [...this.discountRules];
  }

  /**
   * Update a discount rule (with limitations)
   */
  updateDiscountRule(ruleId: string, newPercentage: number, modifiedBy: string): boolean {
    const rule = this.discountRules.find(r => r.id === ruleId);
    
    if (!rule) {
      throw new Error('Discount rule not found');
    }

    if (!rule.isEditable) {
      throw new Error('This discount rule is not editable');
    }

    if (newPercentage < this.MIN_DISCOUNT_PERCENTAGE || newPercentage > this.MAX_DISCOUNT_PERCENTAGE) {
      throw new Error(`Discount percentage must be between ${this.MIN_DISCOUNT_PERCENTAGE}% and ${this.MAX_DISCOUNT_PERCENTAGE}%`);
    }

    rule.discountPercentage = newPercentage;
    rule.lastModified = new Date().toISOString();
    rule.modifiedBy = modifiedBy;

    this.saveToStorage();
    return true;
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category: string): DiscountRule[] {
    return this.discountRules.filter(r => 
      r.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get unique categories
   */
  getCategories(): string[] {
    return Array.from(new Set(this.discountRules.map(r => r.category)));
  }

  /**
   * Get unique brands for a category
   */
  getBrandsForCategory(category: string): string[] {
    return Array.from(new Set(
      this.discountRules
        .filter(r => r.category.toLowerCase() === category.toLowerCase())
        .map(r => r.brand)
        .filter(b => b !== '')
    ));
  }

  /**
   * Save rules to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.discountRules));
    } catch (error) {
      console.error('Failed to save discount rules to storage:', error);
    }
  }

  /**
   * Load rules from localStorage
   */
  private loadFromStorage(): void {
    try {
      const savedRules = localStorage.getItem(this.STORAGE_KEY);
      if (savedRules) {
        const parsedRules = JSON.parse(savedRules);
        // Merge with default rules, keeping user modifications
        this.mergeRules(parsedRules);
      }
    } catch (error) {
      console.error('Failed to load discount rules from storage:', error);
    }
  }

  /**
   * Merge saved rules with default rules
   */
  private mergeRules(savedRules: DiscountRule[]): void {
    savedRules.forEach(savedRule => {
      const existingRule = this.discountRules.find(r => r.id === savedRule.id);
      if (existingRule) {
        existingRule.discountPercentage = savedRule.discountPercentage;
        existingRule.lastModified = savedRule.lastModified;
        existingRule.modifiedBy = savedRule.modifiedBy;
      }
    });
  }

  /**
   * Reset rules to defaults
   */
  resetToDefaults(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    // Reinitialize with default values
    this.discountRules.forEach(rule => {
      rule.lastModified = new Date().toISOString();
      delete rule.modifiedBy;
    });
  }
}

export const discountService = new DiscountService();
