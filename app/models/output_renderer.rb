module OutputRenderer
  # TODO: Sanitize
  def self.diff(lines)
    ApplicationController.new.render_to_string(partial: "templates/diff", locals: { lines: lines }, formats: [:html]).html_safe
  end

  def self.markdown(content)
    Redcarpet::Markdown.new(Redcarpet::Render::HTML.new,
      safe_links_only: true,
      filter_html: true,
      autolink: true,
      fenced_code_blocks: true,
    ).render(content)
  end
end
