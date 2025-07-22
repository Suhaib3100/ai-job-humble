import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';

interface CookiePopupProps {
  onAccept: () => void;
  onReject: () => void;
}

const CookiePopup: React.FC<CookiePopupProps> = ({ onAccept, onReject }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show popup for new users (or if not previously accepted/rejected)
    const cookiePref = localStorage.getItem('cookie_pref');
    if (!cookiePref) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_pref', 'accepted');
    setVisible(false);
    onAccept();
  };

  const handleReject = () => {
    localStorage.setItem('cookie_pref', 'rejected');
    setVisible(false);
    onReject();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center">
      <Card className="max-w-lg w-full shadow-lg border bg-white">
        <CardContent className="p-6 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">Cookie Policy</h2>
          <p className="mb-4 text-center text-gray-700">
            We use cookies to improve your experience. Accept to enable cookies, or reject to disable them. You can change this later in your profile settings.
          </p>
          <div className="flex gap-4">
            <Button className="bg-[#008000] text-white px-4 py-2 rounded" onClick={handleAccept}>Accept</Button>
            <Button className="bg-gray-300 text-gray-800 px-4 py-2 rounded" onClick={handleReject}>Reject</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookiePopup;
