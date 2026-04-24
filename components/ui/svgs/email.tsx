import { type SVGProps } from 'react'

export function Email(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="none"
            {...props}>
            <title>{'Email'}</title>
            <rect
                x={2.5}
                y={5}
                width={19}
                height={14}
                rx={2}
                fill="#3B82F6"
                stroke="#1D4ED8"
                strokeWidth={2}
            />
            <path
                d="M3.5 6.5L12 13L20.5 6.5"
                stroke="#FFFFFF"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}