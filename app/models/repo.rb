require 'delegate'

class Repo < SimpleDelegator
  attr_reader :first_commit, :name

  def initialize(name)
    raise "Repo name not defined" unless name
    @name = name
    path = Sandbox.get_repo_path(name)
    super(Rugged::Repository.new(path))
  end

  def readme
    return @readme if @readme
    h = index.find{ |a| a[:path] =~ /^readme\./i }
    @readme = Readme.new(h ? lookup(h[:oid]).content : "")
  end

  def first_commit
    @first_commit ||= _commits.first
  end

  def commit(sha)
    Commit.new(lookup(sha), commits_indices[sha], self)
  end

  def commits
    @commits ||= _commits.each_with_index.map do |commit, i|
                    {
                      sha: commit.oid,
                      title: readme.headers_human[i],
                      index: i
                    }
                  end
  end

  def commits_indices
    return @commits_indices if @commits_indices
    @commits_indices = {}
    _commits.each_with_index do |commit, i|
      @commits_indices[commit.oid] = i
    end

    @commits_indices
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
