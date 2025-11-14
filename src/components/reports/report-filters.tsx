'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Category = {
  id: string;
  name: string;
  icon: string;
};

type FilterValues = {
  period: string;
  customStartDate?: Date;
  customEndDate?: Date;
  categoryId?: string;
  type?: 'INCOME' | 'EXPENSE' | '';
};

type Props = {
  filters: FilterValues;
  categories: Category[];
  onFilterChange: (filters: FilterValues) => void;
  onExport: (format: 'csv' | 'pdf') => void;
};

export function ReportFilters({ filters, categories, onFilterChange, onExport }: Props) {
  const t = useTranslations();
  const [localFilters, setLocalFilters] = useState<FilterValues>(filters);
  const [showCustomDate, setShowCustomDate] = useState(filters.period === 'custom');

  const periods = [
    { value: 'today', label: t('reports.today') },
    { value: 'thisWeek', label: t('reports.thisWeek') },
    { value: 'thisMonth', label: t('reports.thisMonth') },
    { value: 'lastMonth', label: t('reports.lastMonth') },
    { value: 'last3Months', label: t('reports.last3Months') },
    { value: 'last6Months', label: t('reports.last6Months') },
    { value: 'thisYear', label: t('reports.thisYear') },
    { value: 'lastYear', label: t('reports.lastYear') },
    { value: 'custom', label: t('reports.customRange') },
  ];

  const handlePeriodChange = (period: string) => {
    const isCustom = period === 'custom';
    setShowCustomDate(isCustom);
    setLocalFilters({
      ...localFilters,
      period,
      ...(isCustom ? {} : { customStartDate: undefined, customEndDate: undefined }),
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterValues = {
      period: 'thisMonth',
      customStartDate: undefined,
      customEndDate: undefined,
      categoryId: undefined,
      type: '',
    };
    setLocalFilters(clearedFilters);
    setShowCustomDate(false);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = localFilters.categoryId || localFilters.type || localFilters.period !== 'thisMonth';

  return (
    <Card className="p-3 md:p-4">
      <div className="space-y-3">
        {/* Filters */}
        <div className="space-y-3">
          {/* Period Filter */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('reports.selectPeriod')}</label>
            <Select value={localFilters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Type Filter */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('reports.selectType')}</label>
            <Select 
              value={localFilters.type || 'all'} 
              onValueChange={(value) => setLocalFilters({ ...localFilters, type: value === 'all' ? '' : value as 'INCOME' | 'EXPENSE' })}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('reports.allTypes')}</SelectItem>
                <SelectItem value="INCOME">{t('common.income')}</SelectItem>
                <SelectItem value="EXPENSE">{t('common.expense')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t('reports.selectCategory')}</label>
            <Select 
              value={localFilters.categoryId || 'all'} 
              onValueChange={(value) => setLocalFilters({ ...localFilters, categoryId: value === 'all' ? undefined : value })}
            >
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('reports.allCategories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleApplyFilters} className="flex-1 h-11">
            <Filter className="h-4 w-4 mr-2" />
            {t('reports.applyFilters')}
          </Button>
          {hasActiveFilters && (
            <Button onClick={handleClearFilters} variant="outline" size="icon" className="h-11 w-11 shrink-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Custom Date Range */}
        {showCustomDate && (
          <div className="space-y-3 pt-3 border-t">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('reports.from')}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-10',
                      !localFilters.customStartDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.customStartDate ? (
                      format(localFilters.customStartDate, 'PP')
                    ) : (
                      <span>{t('common.date')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.customStartDate}
                    onSelect={(date) => setLocalFilters({ ...localFilters, customStartDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t('reports.to')}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal h-10',
                      !localFilters.customEndDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.customEndDate ? (
                      format(localFilters.customEndDate, 'PP')
                    ) : (
                      <span>{t('common.date')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={localFilters.customEndDate}
                    onSelect={(date) => setLocalFilters({ ...localFilters, customEndDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t">
          <Button onClick={() => onExport('csv')} variant="outline" className="flex-1 h-10">
            <Download className="h-4 w-4 mr-2" />
            {t('reports.exportCSV')}
          </Button>
          <Button onClick={() => onExport('pdf')} variant="outline" className="flex-1 h-10">
            <Download className="h-4 w-4 mr-2" />
            {t('reports.exportPDF')}
          </Button>
        </div>
      </div>
    </Card>
  );
}

