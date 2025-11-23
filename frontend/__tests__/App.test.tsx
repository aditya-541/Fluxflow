import React from 'react';
import renderer, { ReactTestRendererJSON } from 'react-test-renderer';

import App from '../app/index';

describe('<App />', () => {
    it('has 1 child', () => {
        const tree = renderer.create(<App />).toJSON() as ReactTestRendererJSON;
        expect(tree).not.toBeNull();
        expect(tree.children?.length).toBe(1);
    });
});
