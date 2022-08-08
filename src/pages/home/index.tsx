import type { Props } from '@/interface/components';
import { stores } from '@/stores';
import { Provider } from 'mobx-react';
import EditorCommandGraph from '@/components/EditorCommandGraph';

export default function Index(props: Props) {

  return (
    <Provider {...stores}>
      <EditorCommandGraph />
    </Provider>
  )
};