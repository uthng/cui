// Add async & await to wait axios request terminate completely
// if not, computed value isAclEnabled in page rendering will take
// the default value of consulAcl defined in store before
// the request is promised
export default async function({ app, store }) {
  const acl = app.$consul.acl.list(store.state.ctok)
  var enabled = true

  if (
    acl.response !== undefined &&
    acl.response.data === "ACL support disabled"
  ) {
    enabled = false
  }

  store.dispatch("updateAclStatus", enabled)
}
