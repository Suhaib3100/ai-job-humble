
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Copy } from 'lucide-react';
import { useDocumentGenerator } from '@/hooks/useDocumentGenerator';
import { toast } from 'sonner';

interface DocumentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId?: string;
  opportunityTitle?: string;
}

export const DocumentGeneratorModal: React.FC<DocumentGeneratorModalProps> = ({
  isOpen,
  onClose,
  opportunityId,
  opportunityTitle
}) => {
  const [documentType, setDocumentType] = useState<'cover_letter' | 'cv' | 'sop'>('cover_letter');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);
  
  const { generateDocument, loading } = useDocumentGenerator();

  const handleGenerate = async () => {
    const document = await generateDocument(documentType, opportunityId, additionalInfo);
    if (document) {
      setGeneratedDocument(document);
    }
  };

  const handleCopy = () => {
    if (generatedDocument) {
      navigator.clipboard.writeText(generatedDocument.content);
      toast.success('Document copied to clipboard');
    }
  };

  const handleDownload = () => {
    if (generatedDocument) {
      const blob = new Blob([generatedDocument.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generatedDocument.title}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Document downloaded');
    }
  };

  const handleClose = () => {
    setGeneratedDocument(null);
    setAdditionalInfo('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: '#008000' }} />
            AI Document Generator
            {opportunityTitle && (
              <span className="text-sm font-normal text-gray-600">
                for {opportunityTitle}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {!generatedDocument ? (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Document Type</label>
              <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover_letter">Cover Letter</SelectItem>
                  <SelectItem value="cv">Curriculum Vitae (CV)</SelectItem>
                  <SelectItem value="sop">Statement of Purpose</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Additional Information (Optional)
              </label>
              <Textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Add any specific details, achievements, or requirements you'd like to include..."
                className="min-h-[100px]"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">AI will generate:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {documentType === 'cover_letter' && (
                  <>
                    <li>• Personalized cover letter tailored to the opportunity</li>
                    <li>• ATS-optimized formatting and keywords</li>
                    <li>• Professional tone matching your profile</li>
                  </>
                )}
                {documentType === 'cv' && (
                  <>
                    <li>• Complete CV with your profile information</li>
                    <li>• Professional formatting and structure</li>
                    <li>• ATS-friendly layout and keywords</li>
                  </>
                )}
                {documentType === 'sop' && (
                  <>
                    <li>• Compelling statement of purpose</li>
                    <li>• Career goals and motivation</li>
                    <li>• Tailored to the specific opportunity</li>
                  </>
                )}
              </ul>
            </div>

            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-[#008000] hover:bg-[#008000]/90 text-white">
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" style={{ borderColor: '#008000', borderTopColor: 'transparent' }} />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" style={{ color: '#008000' }} />
                  Generate Document
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{generatedDocument.title}</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" style={{ color: '#008000' }} />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" style={{ color: '#008000' }} />
                  Download
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
                  {generatedDocument.content}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setGeneratedDocument(null)}>
                Generate Another
              </Button>
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
