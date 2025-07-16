
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface OpportunityArrayFieldsProps {
  requirements: string[];
  benefits: string[];
  tags: string[];
  onRequirementsChange: (requirements: string[]) => void;
  onBenefitsChange: (benefits: string[]) => void;
  onTagsChange: (tags: string[]) => void;
}

const OpportunityArrayFields = ({
  requirements,
  benefits,
  tags,
  onRequirementsChange,
  onBenefitsChange,
  onTagsChange
}: OpportunityArrayFieldsProps) => {
  const [requirementInput, setRequirementInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const addRequirement = () => {
    if (!requirementInput.trim()) return;
    onRequirementsChange([...requirements, requirementInput.trim()]);
    setRequirementInput('');
  };

  const removeRequirement = (index: number) => {
    onRequirementsChange(requirements.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    if (!benefitInput.trim()) return;
    onBenefitsChange([...benefits, benefitInput.trim()]);
    setBenefitInput('');
  };

  const removeBenefit = (index: number) => {
    onBenefitsChange(benefits.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    onTagsChange([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Requirements */}
      <div className="space-y-2">
        <Label>Requirements</Label>
        <div className="flex gap-2">
          <Input
            value={requirementInput}
            onChange={(e) => setRequirementInput(e.target.value)}
            placeholder="Add a requirement"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
          />
          <Button type="button" onClick={addRequirement} size="sm" className="bg-[#008000] hover:bg-[#006400] text-white">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {requirements.map((req, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {req}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => removeRequirement(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        <Label>Benefits</Label>
        <div className="flex gap-2">
          <Input
            value={benefitInput}
            onChange={(e) => setBenefitInput(e.target.value)}
            placeholder="Add a benefit"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
          />
          <Button type="button" onClick={addBenefit} size="sm" className="bg-[#008000] hover:bg-[#006400] text-white">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {benefits.map((benefit, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {benefit}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => removeBenefit(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="sm" className="bg-[#008000] hover:bg-[#006400] text-white">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {tag}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => removeTag(index)}
              />
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
};

export default OpportunityArrayFields;
