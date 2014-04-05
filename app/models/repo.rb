require 'delegate'

class Repo < SimpleDelegator
  def initialize(name)
    raise "Repo name not defined" unless name

    path = Sandbox.get_repo_path(name)
    super(Rugged::Repository.new(path))
  end

  def commit(sha)
    Commit.new(lookup(sha), self)
  end

  def commits
    @commits ||= walk(last_commit.oid, Rugged::SORT_REVERSE).map do |commit|
                    {
                      sha: commit.oid,
                      title: commit.message.split(/\n/).first
                    }
                  end
  end

  def diffs_from_last(sha_or_commit)
    commit = sha_or_commit.is_a?(String) ? lookup(sha_or_commit) : sha_or_commit

    source = commit.parents.present? ? commit.parents.first : nil
    diff(source, commit)
  end
end
