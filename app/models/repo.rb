require 'delegate'

class Repo < SimpleDelegator
  attr_reader :first_commit, :name

  def initialize(name)
    raise "Repo name not defined" unless name
    @name = name
    path = Sandbox.get_repo_path(name)
    super(Rugged::Repository.new(path))
  end

  def first_commit
    @first_commit ||= _commits.first
  end

  def commit(sha)
    Commit.new(lookup(sha), self)
  end

  def commits
    @commits ||= _commits.map do |commit|
                    {
                      sha: commit.oid,
                      title: commit.message.split(/\n/).first
                    }
                  end
  end

  def _commits
    walk(last_commit.oid, Rugged::SORT_REVERSE)
  end

  def diffs_from_last(sha_or_commit)
    commit = sha_or_commit.is_a?(String) ? lookup(sha_or_commit) : sha_or_commit

    source = commit.parents.present? ? commit.parents.first : nil
    diff(source, commit)
  end
end
