import {Tooltip} from './Tooltip.jsx';

export const InteractiveMapObject = ({ objData, onClick, onPointerEnter, onPointerLeave, parentRef }) => {
  return <primitive
    object={objData.mesh}
    onClick={onClick}
    onPointerEnter={onPointerEnter}
    onPointerLeave={onPointerLeave}
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
