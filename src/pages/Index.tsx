import React from 'react';
import { OSProvider, useOS } from '@/os/OSContext';
import BootScreen from '@/os/BootScreen';
import LockScreen from '@/os/LockScreen';
import Desktop from '@/os/Desktop';

const OSContent: React.FC = () => {
  const { isBooting, isLocked } = useOS();
  if (isBooting) return <BootScreen />;
  if (isLocked) return <LockScreen />;
  return <Desktop />;
};

const Index = () => (
  <OSProvider>
    <OSContent />
  </OSProvider>
);

export default Index;
