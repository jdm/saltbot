const validOutput = "servo-linux1:\n\
    Filesystem      Size  Used Avail Use% Mounted on\n\
    udev             15G   12K   15G   1% /dev\n\
    tmpfs           3.0G  360K  3.0G   1% /run\n\
    /dev/xvda1      126G   82G   40G  68% /\n\
    none            4.0K     0  4.0K   0% /sys/fs/cgroup\n\
    none            5.0M     0  5.0M   0% /run/lock\n\
    none             15G   12K   15G   1% /run/shm\n\
    none            100M     0  100M   0% /run/user";

const validMacOutput = "servo-mac1:\n\
    Filesystem      Size   Used  Avail Capacity  iused     ifree %iused  Mounted on\n\
    /dev/disk0s2   465Gi   70Gi  394Gi    16% 18536540 103350202   15%   /\n\
    devfs          178Ki  178Ki    0Bi   100%      614         0  100%   /dev\n\
    map -hosts       0Bi    0Bi    0Bi   100%        0         0  100%   /net\n\
    map auto_home    0Bi    0Bi    0Bi   100%        0         0  100%   /home"

const invalidOutput = "No minions matched the target. No command was sent, no jid was assigned."

const invalidOutput2 = "servo-linux1:\n\
    Filesystem      Size  Used Avail Use% Mounted on";

const invalidOutput3 = "servo-linux1:\n\
    \n\
    ";

const invalidOutput4 = "servo-linux1:\n\
    Filesystem      Size  Used Avail Use% Mounted on\n\
    udev             15G   12K   15G   1% /dev\n\
    tmpfs           3.0G  360K  3.0G   1% /run\n\
    none            4.0K     0  4.0K   0% /sys/fs/cgroup\n\
    none            5.0M     0  5.0M   0% /run/lock\n\
    none             15G   12K   15G   1% /run/shm\n\
    none            100M     0  100M   0% /run/user";

function parseUsage(output, minion) {
    const minionPrefixEnd = minion.indexOf('*');
    const minionIsPattern = minionPrefixEnd > -1;
    const minionPrefix = minionIsPattern ? minion.slice(0, minionPrefixEnd) : minion;
    if (output.indexOf(minionPrefix) != 0) {
        return null;
    }
    let lines = output.split('\n');
    if (lines.length < 3) {
        return null;
    }
    const names = lines[1].split(' ').filter((s) => s.length > 0);
    if (names.length == 0 || names[0] != "Filesystem") {
        return null;
    }

    for (const line of lines) {
        const fields = line.split(' ').filter((s) => s.length > 0);
        if (fields.length > 0 && fields[fields.length - 1] == '/') {
            return fields.length >= 5 ? fields[4] : null;
        }
    }

    return null;
}

exports.parseUsage = parseUsage;

/*console.log(parseUsage(validOutput, "servo-linux1") == "68%");
console.log(parseUsage(validOutput, "servo-linux*") == "68%");
console.log(parseUsage(invalidOutput, "servo-linux1") == null);
console.log(parseUsage(invalidOutput2, "servo-linux1") == null);
console.log(parseUsage(invalidOutput3, "servo-linux1") == null);
console.log(parseUsage(invalidOutput4, "servo-linux1") == null);
console.log(parseUsage(validOutput, "servo-mac1") == null);
console.log(parseUsage(validOutput, "servo-mac*") == null);
console.log(parseUsage(validMacOutput, "servo-mac1") == "16%");
console.log(parseUsage(validMacOutput, "servo-mac*") == "16%");*/

