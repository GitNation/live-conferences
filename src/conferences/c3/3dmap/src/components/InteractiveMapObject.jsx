import {Tooltip} from './Tooltip.jsx';
import {useState, useEffect} from 'react';

export const InteractiveMapObject = ({objData, onClick, onPointerEnter, onPointerLeave, parentRef}) => {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => document.body.style.cursor = 'auto';
  }, [hovered]);

  return <primitive
    object={objData.mesh}
    onClick={onClick}
    onPointerEnter={() => {
      setHovered(true);
      onPointerEnter(objData);
    }}
    onPointerLeave={() => {
      setHovered(false);
      onPointerLeave(objData);
    }}
  >
    <Tooltip
      objData={objData}
      parentRef={parentRef}
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    />
  </primitive>;
};
