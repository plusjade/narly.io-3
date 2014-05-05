class Step
  attr_reader :index

  def initialize(index, repo)
    @index = index.to_i
    @repo = repo
  end

  def content
    @repo.readme.chunk(@index)
  end

  def payload
    {
      index: @index,
    }
    .merge(content)
    .merge(commit_payload)
  end

  def commit
    @commit ||= @repo.commit_at(@index)
  end

  def commit_payload
    commit ? commit.payload : { diffs: [], snapshot: [] }
  end
end
