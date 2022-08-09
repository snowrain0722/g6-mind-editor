import { Button } from 'antd';
import { Toolbar } from '@antv/x6-react-components';
import {
  UndoOutlined,
  RedoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import '@antv/x6-react-components/es/toolbar/style/index.css';

interface Props {
  handleSave?: () => void;
  [propName: string]: any;
};

const { Group, Item } = Toolbar;

export default function Index(props: Props) {

  const { handleSave } = props;

  const onClick = (name: string) => {
    console.log({ name });
  };

  return (
    <Toolbar
      size="big"
      onClick={onClick}
      extra={
        <Button
          type="primary"
          htmlType="submit"
          onClick={handleSave}
        >
          保存
        </Button>
      }
    >
      <Group>
        <Item name="undo" tooltip="撤销" icon={<UndoOutlined />} />
        <Item name="redo" tooltip="重做" icon={<RedoOutlined />} />
      </Group>
      <Group>
        <Item name="zoomIn" tooltip="放大" icon={<ZoomInOutlined />} />
        <Item name="zoomOut" tooltip="缩小" icon={<ZoomOutOutlined />} />
      </Group>
    </Toolbar>
  )
};