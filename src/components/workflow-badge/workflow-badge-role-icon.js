import React from 'react';
import noop from 'lodash/noop';

const WorkflowBadgeRoleIcon = ({
  roleName,
  roleIcon,
  backgroundColor,
  foregroundColor,
  count = 1,
  onMouseEnter = noop,
  onMouseLeave = noop
}) => {
  const renderAuthorTool = () => {
    return (
      <g
        fill={backgroundColor}
        className="workflow-badge-role-icon__tool-icon"
        transform="translate(4,11.5)"
      >
        <polygon points="2.7222 1.2051 1.2442 2.6841 5.5222 7.0001 7.0002 7.0001 7.0002 5.5221"></polygon>
        <path d="M0.7778,2.2949 L2.2558,0.8159 L1.5558,0.1159 C1.3998,-0.0391 1.1668,-0.0391 1.0108,0.1159 L0.1168,1.0109 C-0.0392,1.1669 -0.0392,1.3999 0.1168,1.5559 L0.7778,2.2949 Z"></path>
      </g>
    );
  };

  const renderEditorTool = () => {
    return (
      <g
        fill={backgroundColor}
        className="workflow-badge-role-icon__tool-icon"
        transform="translate(4,11.5)"
      >
        <polygon
          id="Fill-1"
          points="0 4.26581 2.133 6.39881 3.199 5.33181 1.066 3.19981"
        ></polygon>
        <polygon
          id="Fill-2"
          points="4.2678 -0.00019 3.2018 1.06581 5.3338 3.19981 6.4008 2.13281"
        ></polygon>
        <polygon
          id="Fill-3"
          points="1.6011 2.66561 6.9331 7.99861 8.0001 6.93161 2.6681 1.59961"
        ></polygon>
      </g>
    );
  };

  const renderReviewerTool = () => {
    return (
      <g
        className="workflow-badge-role-icon__tool-icon"
        transform="translate(4,11.5)"
      >
        <path
          d="M8.078,9.08605 L4.916,5.92405 C4.421,6.23505 3.836,6.41605 3.208,6.41605 C1.436,6.41605 0,4.98005 0,3.20805 C0,1.43705 1.436,5e-05 3.208,5e-05 C4.979,5e-05 6.416,1.43705 6.416,3.20805 C6.416,3.83605 6.236,4.42105 5.924,4.91605 L9,7.96005 L8.078,9.08605 Z"
          fill={backgroundColor}
        ></path>
        <path
          d="M3.2079,4.99035 C4.1919,4.99035 4.9899,4.19235 4.9899,3.20835 C4.9899,2.22335 4.1919,1.42635 3.2079,1.42635 C2.2239,1.42635 1.4259,2.22335 1.4259,3.20835 C1.4259,4.19235 2.2239,4.99035 3.2079,4.99035"
          fill={foregroundColor}
        ></path>
      </g>
    );
  };

  const renderProducerTool = () => {
    return (
      <g
        className="workflow-badge-role-icon__tool-icon"
        transform="translate(4,11.5)"
      >
        <path
          d="M8.88215269,7.31171825 L5.16515269,3.59471825 C5.53215269,2.65571825 5.32815269,1.55271825 4.55215269,0.77671825 C3.73515269,-0.0412817502 2.51015269,-0.20428175 1.52915269,0.24571825 L3.28615269,2.00171825 L2.06015269,3.22771825 L0.26315269,1.47071825 C-0.22684731,2.45171825 -0.0228473099,3.67671825 0.79415269,4.49371825 C1.57015269,5.26971825 2.67315269,5.47371825 3.61215269,5.10671825 L7.33015269,8.82371825 C7.49315269,8.98671825 7.73815269,8.98671825 7.90215269,8.82371825 L8.84115269,7.88371825 C9.04615269,7.72071825 9.04615269,7.43471825 8.88215269,7.31171825"
          id="Fill-1"
          fill={backgroundColor}
        ></path>
      </g>
    );
  };
  return (
    <g
      stroke="none"
      strokeWidth="1"
      fill="none"
      fillRule="evenodd"
      className="workflow-badge-role-icon"
      title={roleName}
      opacity={count === 0 ? '0.5' : '1'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {count > 1 && (
        <g transform="translate(15.5,5)">
          <circle
            cx="0"
            cy="0"
            r="4"
            stroke={backgroundColor}
            fill={foregroundColor}
            strokeWidth="0"
            className="workflow-badge-role-icon__count-circle"
          />
          <text
            x="0"
            y="2.25"
            fill={backgroundColor}
            className="workflow-badge-role-icon__count"
            textAnchor="middle"
          >
            {count}
          </text>
        </g>
      )}
      <g
        stroke={backgroundColor}
        fill={foregroundColor}
        className="workflow-badge-role-icon__person"
      >
        <path d="M0.375,20.125 L0.375,13.813 C0.375,10.413 4.499,7.5 7.875,7.5 C11.251,7.5 15.375,10.413 15.375,13.813 L15.375,20.125 L0.375,20.125 Z"></path>
        <path
          d="M3.3437,4.75 C3.3437,2.297 5.2657,0.375 7.7187,0.375 C10.1717,0.375 12.0937,2.297 12.0937,4.75 C12.0937,7.203 10.1717,9.125 7.7187,9.125 C5.2657,9.125 3.3437,7.203 3.3437,4.75 Z"
          id="Fill-5"
          strokeWidth="1.5"
        ></path>
      </g>
      {roleName === 'Authors' && renderAuthorTool()}
      {roleName === 'Editors' && renderEditorTool()}
      {roleName === 'Reviewers' && renderReviewerTool()}
      {roleName === 'Producers' && renderProducerTool()}
    </g>
  );
};
export default WorkflowBadgeRoleIcon;
