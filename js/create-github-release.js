module.exports = async ({github, context, core, glob, io, exec, getOctokit}) => {
  const data = JSON.parse(core.getInput('inputs', { required: false }));

  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const tag = data.tag;
  const sha = data.sha;
  const force = Boolean(data.force);

  core.info(
    `Publishing release note for '${tag}' on '${owner}/${repo}' (force=${force})`
  );

  // Decode base64 encoded body
  const body = Buffer.from(data.body, 'base64').toString('utf-8');

  async function forceMoveTag() {
    const ref = `tags/${tag}`;

    try {
      await github.rest.git.deleteRef({
        owner: owner,
        repo: repo,
        ref: ref,
      });
      core.info(`Deleted existing tag '${tag}' to move it to '${sha}'`);
    } catch (err) {
      core.info(`Tag '${tag}' does not exist, will be created`);
    }

    await github.rest.git.createRef({
      owner: owner,
      repo: repo,
      ref: `refs/tags/${tag}`,
      sha: sha,
    });

    core.info(`Tag '${tag}' is now pointing to '${sha}'`);
  }

  async function createOrUpdateRelease() {
    try {
      const existingRelease = await github.rest.repos.getReleaseByTag({
        owner: owner,
        repo: repo,
        tag: tag,
      });

      core.info(`Release for tag ${tag} exists, updating it`);

      await github.rest.repos.updateRelease({
        owner: owner,
        repo: repo,
        release_id: existingRelease.data.id,
        tag_name: tag,
        name: data.name,
        body,
        draft: false,
        prerelease: false,
      });

      core.info(`Release '${tag}' updated successfully`);
    } catch (err) {
      if (err.status !== 404) {
        throw err;
      }

      core.info(`Release for tag '${tag}' does not exist, creating it`);

      await github.rest.repos.createRelease({
        owner: owner,
        repo: repo,
        tag_name: tag,
        target_commitish: sha,
        name: data.name,
        body,
        draft: false,
        prerelease: false,
      });

      core.info(`Release '${tag}' created successfully`);
    }
  }

  if (force) {
    await forceMoveTag();
  } else {
    core.info(`Force disabled, tag '${tag}' will not be moved`);
  }
  await createOrUpdateRelease();
};
