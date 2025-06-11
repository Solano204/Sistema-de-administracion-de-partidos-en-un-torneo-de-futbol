import React from 'react';
import { GeneralContainer } from '../../agenda/components/GeneralContainer';
import { MatchSelectorToggle } from '../../agenda/components/Selector';

const page = () => {
  return (
    <div>
            <MatchSelectorToggle />

        <GeneralContainer />
      
    </div>
  );
}

export default page;
