  export const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
            <td className="px-4 py-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto"></div>
            </td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded"></div></td>
            <td className="px-6 py-4 flex gap-2">
                <div className="h-8 w-12 bg-gray-200 rounded"></div>
                <div className="h-8 w-12 bg-gray-200 rounded"></div>
            </td>
        </tr>
    );