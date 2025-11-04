import { UserInfo } from 'rusty-motors-shared';

export function userDiff(
    userInfo1: UserInfo,
    userInfo2: UserInfo,
): {
    isDataDiff: boolean;
    diffs: { name: string; before: any; after: any }[];
} {
    let isDataDiff = true;
    const diffs: { name: string; before: any; after: any }[] = [];

    const props1 = Object.entries(userInfo1);
    const props2 = Object.entries(userInfo2);

    for (let i = 0; i < props1.length; i++) {
        const prop = props1[i];
        if (typeof prop !== 'undefined') {
            const propName = prop[0];
            if (props1[0] !== props2[0]) {
                diffs.push({
                    name: propName,
                    before: props1[i],
                    after: props2[i],
                });
                isDataDiff = true;
            }
        }
    }

    return {
        isDataDiff,
        diffs,
    };
}
