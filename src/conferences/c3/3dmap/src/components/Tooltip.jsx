import {Html} from '@react-three/drei';
import {useState} from 'react';

export const Tooltip = ({objData, parentRef, onClick, onPointerEnter, onPointerLeave}) => {
  const [hovered, setHovered] = useState(false);
  const classname = !hovered ? 'htmlWrapper' : 'htmlWrapperOpen';

  return <Html
    wrapperClass={classname}
    zIndexRange={[1000, 0]}
    portal={parentRef}
  >
    <div
      onClick={() => {
        onClick();
      }}
      onMouseOver={() => {
        setHovered(true);
        onPointerEnter();
      }}
      onMouseLeave={() => {
        setHovered(false);
        onPointerLeave();
      }}
      className={'label'}>
      {objData.label}
      {hovered &&
        <div className={'tooltip'}>
          {objData.tooltip}
        </div>
      }
    </div>

  </Html>;
};
