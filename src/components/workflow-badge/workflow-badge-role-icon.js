import React from 'react';

const WorkflowBadgeRoleIcon = ({
  roleName,
  roleIcon,
  strokeColor,
  fillColor
}) => (
  <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
    <g stroke={strokeColor} fill={fillColor} strokeWidth="1.5">
      <path
        d="M0.375,20.125 L0.375,13.813 C0.375,10.413 4.499,7.5 7.875,7.5 C11.251,7.5 15.375,10.413 15.375,13.813 L15.375,20.125 L0.375,20.125 Z"
        id="Fill-1"
      ></path>
      <path
        d="M3.3437,4.75 C3.3437,2.297 5.2657,0.375 7.7187,0.375 C10.1717,0.375 12.0937,2.297 12.0937,4.75 C12.0937,7.203 10.1717,9.125 7.7187,9.125 C5.2657,9.125 3.3437,7.203 3.3437,4.75 Z"
        id="Fill-5"
      ></path>
    </g>
  </g>
);
export default WorkflowBadgeRoleIcon;
