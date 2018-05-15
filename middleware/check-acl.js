// Add async & await to wait axios request terminate completely
// if not, computed value isAclEnabled in page rendering will take
// the default value of consulAcl defined in store before
// the request is promised
export default async function({ store }) {
  await store.dispatch("checkConsulAcl")
}
