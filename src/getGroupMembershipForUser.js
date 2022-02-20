const getGroupMembershipForUser = async (username, activeDirectory) => new Promise((resolve, reject) => {
    activeDirectory.getGroupMembershipForUser(username, (err, groups) => {
        if (err) {
          reject(err)
          return;
        }
        
        const groupCommonNames = groups.map(group => group.cn);
        resolve(groupCommonNames);
      })
});

module.exports = getGroupMembershipForUser;