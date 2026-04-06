import React, { useState } from 'react';
import ForgotPassword from './ForgotPassword';
import OtpVerification from './OtpVerification';
import ResetPassword from './ResetPassword';


const ForgotFlow: React.FC = () => {
  const [step, setStep] = useState(0);

  return (
    <div>
      {step === 0 && <ForgotPassword />}
      {step === 1 && <OtpVerification onNext={() => setStep(2)} />}
      {step === 2 && <ResetPassword />}
    </div>
  );
};

export default ForgotFlow;
